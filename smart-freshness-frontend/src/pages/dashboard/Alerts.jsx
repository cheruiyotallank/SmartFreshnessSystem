import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaBell, FaExclamationTriangle, FaCheckCircle, FaCog, FaTimes, FaSave } from "react-icons/fa";
import API_BASE_URL from "../../config";

const API_URL = `${API_BASE_URL}/api/alerts`;

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [config, setConfig] = useState({ freshnessThreshold: 60, cooldownMinutes: 30 });
    const [filter, setFilter] = useState("all"); // "all", "recent", "sent", "failed"
    const [showSettings, setShowSettings] = useState(false);
    const [editConfig, setEditConfig] = useState({ freshnessThreshold: 60, cooldownMinutes: 30 });
    const [saving, setSaving] = useState(false);

    const getAuthToken = () => {
        const user = localStorage.getItem("user");
        if (user) {
            const parsed = JSON.parse(user);
            return parsed.token;
        }
        return null;
    };

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const endpoint = filter === "recent" ? `${API_URL}/recent` : API_URL;
            const res = await fetch(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch alerts");
            const data = await res.json();
            setAlerts(data);
            setError("");
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/config`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setConfig(data);
                setEditConfig(data);
            }
        } catch (err) {
            console.error("Failed to fetch config:", err);
        }
    };

    const handleSaveConfig = async () => {
        try {
            setSaving(true);
            const token = getAuthToken();
            const res = await fetch(`${API_URL}/config`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(editConfig),
            });

            if (!res.ok) throw new Error("Failed to update configuration");

            const data = await res.json();
            setConfig({
                freshnessThreshold: data.freshnessThreshold,
                cooldownMinutes: data.cooldownMinutes,
            });
            setShowSettings(false);
            toast.success("Configuration updated successfully!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        fetchConfig();
    }, [filter]);

    const filteredAlerts = alerts.filter(alert => {
        if (filter === "sent") return alert.sent;
        if (filter === "failed") return !alert.sent;
        return true;
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    if (loading && alerts.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const sentCount = alerts.filter(a => a.sent).length;
    const failedCount = alerts.filter(a => !a.sent).length;

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-theme-primary">
                    <FaBell className="text-yellow-500" /> Alerts
                </h3>
                <button
                    onClick={() => {
                        setEditConfig(config);
                        setShowSettings(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-theme-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                    <FaCog className="text-theme-muted" />
                    <span className="text-theme-secondary">
                        Threshold: <strong>{config.freshnessThreshold}%</strong> |
                        Cooldown: <strong>{config.cooldownMinutes}min</strong>
                    </span>
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-theme-card rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-bold text-theme-primary">Alert Settings</h4>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="text-theme-muted hover:text-theme-primary"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-theme-secondary text-sm font-medium mb-1">
                                    Freshness Threshold (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editConfig.freshnessThreshold}
                                    onChange={(e) => setEditConfig({
                                        ...editConfig,
                                        freshnessThreshold: parseInt(e.target.value) || 0
                                    })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none border-theme-input focus:ring-green-400"
                                />
                                <p className="text-xs text-theme-muted mt-1">
                                    Alert triggers when freshness drops below this value
                                </p>
                            </div>

                            <div>
                                <label className="block text-theme-secondary text-sm font-medium mb-1">
                                    Cooldown (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1440"
                                    value={editConfig.cooldownMinutes}
                                    onChange={(e) => setEditConfig({
                                        ...editConfig,
                                        cooldownMinutes: parseInt(e.target.value) || 1
                                    })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none border-theme-input focus:ring-green-400"
                                />
                                <p className="text-xs text-theme-muted mt-1">
                                    Minimum time between alerts for the same unit
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 text-theme-secondary hover:bg-theme-tertiary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveConfig}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {saving ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <FaSave />
                                )}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div
                    onClick={() => setFilter("all")}
                    className={`bg-theme-card p-4 rounded-lg shadow-theme cursor-pointer border-2 ${filter === "all" ? "border-blue-500" : "border-transparent"}`}
                >
                    <p className="text-3xl font-bold text-theme-primary">{alerts.length}</p>
                    <p className="text-theme-muted">Total Alerts</p>
                </div>
                <div
                    onClick={() => setFilter("recent")}
                    className={`bg-theme-card p-4 rounded-lg shadow-theme cursor-pointer border-2 ${filter === "recent" ? "border-blue-500" : "border-transparent"}`}
                >
                    <p className="text-3xl font-bold text-orange-500">{alerts.filter(a => {
                        const created = new Date(a.createdAt);
                        const now = new Date();
                        return (now - created) < (24 * 60 * 60 * 1000);
                    }).length}</p>
                    <p className="text-theme-muted">Last 24 Hours</p>
                </div>
                <div
                    onClick={() => setFilter("sent")}
                    className={`bg-theme-card p-4 rounded-lg shadow-theme cursor-pointer border-2 ${filter === "sent" ? "border-blue-500" : "border-transparent"}`}
                >
                    <p className="text-3xl font-bold text-green-600">{sentCount}</p>
                    <p className="text-theme-muted">Sent Successfully</p>
                </div>
                <div
                    onClick={() => setFilter("failed")}
                    className={`bg-theme-card p-4 rounded-lg shadow-theme cursor-pointer border-2 ${filter === "failed" ? "border-blue-500" : "border-transparent"}`}
                >
                    <p className="text-3xl font-bold text-red-600">{failedCount}</p>
                    <p className="text-theme-muted">Failed</p>
                </div>
            </div>

            {/* Alerts List */}
            <div className="bg-theme-card shadow-theme rounded-lg">
                {filteredAlerts.length === 0 ? (
                    <div className="p-8 text-center text-theme-muted">
                        <FaBell className="text-4xl mx-auto mb-2 opacity-30" />
                        <p>No alerts found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-theme">
                        {filteredAlerts.map((alert) => (
                            <div key={alert.id} className="p-4 hover:bg-theme-tertiary/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${alert.sent ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-red-100 dark:bg-red-900/30 text-red-600"}`}>
                                            {alert.sent ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-theme-primary">
                                                    Unit: {alert.unit?.name || `Unit ${alert.unit?.id}`}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${alert.freshnessScore < 40 ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                                                    alert.freshnessScore < 60 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" :
                                                        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                    }`}>
                                                    {alert.freshnessScore}% Freshness
                                                </span>
                                            </div>
                                            <p className="text-sm text-theme-secondary mt-1 whitespace-pre-line">{alert.message}</p>
                                            <div className="flex gap-4 mt-2 text-xs text-theme-muted">
                                                <span>Created: {formatDate(alert.createdAt)}</span>
                                                {alert.sentAt && <span>Sent: {formatDate(alert.sentAt)}</span>}
                                                <span>To: {alert.recipients}</span>
                                            </div>
                                            {alert.errorMessage && (
                                                <p className="text-xs text-red-500 dark:text-red-400 mt-1">Error: {alert.errorMessage}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${alert.sent ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                                        {alert.sent ? "Sent" : "Failed"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

