import React, { useEffect, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import API_BASE_URL from "../../config";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { FaChartLine, FaExclamationTriangle, FaLeaf, FaTrash, FaThermometerHalf } from "react-icons/fa";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const API_URL = `${API_BASE_URL}/api/analytics`;

export default function Analytics() {
    const [summary, setSummary] = useState(null);
    const [freshnessTrend, setFreshnessTrend] = useState([]);
    const [alertFrequency, setAlertFrequency] = useState([]);
    const [freshnessDistribution, setFreshnessDistribution] = useState({});
    const [wasteMetrics, setWasteMetrics] = useState({});
    const [sensorMetrics, setSensorMetrics] = useState({});
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);

    const getAuthToken = () => {
        const user = localStorage.getItem("user");
        if (user) {
            const parsed = JSON.parse(user);
            return parsed.token;
        }
        return null;
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            const headers = { Authorization: `Bearer ${token}` };

            const [summaryRes, trendRes, alertRes, distRes, wasteRes, sensorRes] = await Promise.all([
                fetch(`${API_URL}/summary`, { headers }),
                fetch(`${API_URL}/freshness-trend?days=${days}`, { headers }),
                fetch(`${API_URL}/alert-frequency?days=${days}`, { headers }),
                fetch(`${API_URL}/freshness-distribution`, { headers }),
                fetch(`${API_URL}/waste-metrics`, { headers }),
                fetch(`${API_URL}/sensor-metrics`, { headers }),
            ]);

            if (summaryRes.ok) setSummary(await summaryRes.json());
            if (trendRes.ok) setFreshnessTrend(await trendRes.json());
            if (alertRes.ok) setAlertFrequency(await alertRes.json());
            if (distRes.ok) setFreshnessDistribution(await distRes.json());
            if (wasteRes.ok) setWasteMetrics(await wasteRes.json());
            if (sensorRes.ok) setSensorMetrics(await sensorRes.json());
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [days]);

    const freshnessTrendData = {
        labels: freshnessTrend.map(d => d.date),
        datasets: [{
            label: "Average Freshness (%)",
            data: freshnessTrend.map(d => d.avgFreshness),
            borderColor: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
        }]
    };

    const alertFrequencyData = {
        labels: alertFrequency.map(d => d.date),
        datasets: [{
            label: "Alerts",
            data: alertFrequency.map(d => d.alertCount),
            backgroundColor: "#ef4444",
            borderRadius: 4,
        }]
    };

    const distributionData = {
        labels: ["Critical (<20%)", "Poor (20-40%)", "Moderate (40-60%)", "Good (60-80%)", "Excellent (>80%)"],
        datasets: [{
            data: [
                freshnessDistribution.critical || 0,
                freshnessDistribution.poor || 0,
                freshnessDistribution.moderate || 0,
                freshnessDistribution.good || 0,
                freshnessDistribution.excellent || 0,
            ],
            backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"],
        }]
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold flex items-center gap-2 text-theme-primary">
                    <FaChartLine className="text-green-500" /> Dashboard Analytics
                </h3>
                <select
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="px-4 py-2 border rounded-lg border-theme-input bg-theme-input text-theme-primary"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-theme-card p-4 rounded-lg shadow-theme">
                    <div className="flex items-center gap-3">
                        <FaLeaf className="text-2xl text-green-500" />
                        <div>
                            <p className="text-2xl font-bold text-theme-primary">{Math.round(summary?.avgFreshness || 0)}%</p>
                            <p className="text-sm text-theme-muted">Avg Freshness</p>
                        </div>
                    </div>
                </div>
                <div className="bg-theme-card p-4 rounded-lg shadow-theme">
                    <div className="flex items-center gap-3">
                        <FaExclamationTriangle className="text-2xl text-red-500" />
                        <div>
                            <p className="text-2xl font-bold text-theme-primary">{summary?.alertsToday || 0}</p>
                            <p className="text-sm text-theme-muted">Alerts Today</p>
                        </div>
                    </div>
                </div>
                <div className="bg-theme-card p-4 rounded-lg shadow-theme">
                    <div className="flex items-center gap-3">
                        <FaTrash className="text-2xl text-orange-500" />
                        <div>
                            <p className="text-2xl font-bold text-theme-primary">{wasteMetrics?.wasteRiskPercentage || 0}%</p>
                            <p className="text-sm text-theme-muted">Waste Risk</p>
                        </div>
                    </div>
                </div>
                <div className="bg-theme-card p-4 rounded-lg shadow-theme">
                    <div className="flex items-center gap-3">
                        <FaThermometerHalf className="text-2xl text-blue-500" />
                        <div>
                            <p className="text-2xl font-bold text-theme-primary">{Math.round(sensorMetrics?.avgTemperature || 0)}°C</p>
                            <p className="text-sm text-theme-muted">Avg Temperature</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-theme-card p-4 rounded-lg shadow-theme">
                    <h4 className="text-lg font-semibold mb-4 text-theme-primary">Freshness Trend</h4>
                    <Line data={freshnessTrendData} options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { min: 0, max: 100 },
                            x: { ticks: { color: 'var(--text-muted)' } }
                        }
                    }} />
                </div>
                <div className="bg-theme-card p-4 rounded-lg shadow-theme">
                    <h4 className="text-lg font-semibold mb-4 text-theme-primary">Alert Frequency</h4>
                    <Bar data={alertFrequencyData} options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            x: { ticks: { color: 'var(--text-muted)' } }
                        }
                    }} />
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-theme-card p-4 rounded-lg shadow-theme">
                    <h4 className="text-lg font-semibold mb-4 text-theme-primary">Freshness Distribution</h4>
                    <Doughnut data={distributionData} options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom', labels: { color: 'var(--text-primary)' } }
                        }
                    }} />
                </div>
                <div className="bg-theme-card p-4 rounded-lg shadow-theme col-span-2">
                    <h4 className="text-lg font-semibold mb-4 text-theme-primary">Waste Metrics</h4>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-red-500">{wasteMetrics?.lowFreshnessUnits || 0}</p>
                            <p className="text-sm text-theme-muted">Low Freshness Units</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-theme-primary">{wasteMetrics?.totalUnits || 0}</p>
                            <p className="text-sm text-theme-muted">Total Units</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-500">${wasteMetrics?.potentialSavings || 0}</p>
                            <p className="text-sm text-theme-muted">Potential Savings</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="w-full bg-theme-tertiary rounded-full h-4">
                            <div
                                className="bg-gradient-to-r from-green-500 to-red-500 h-4 rounded-full"
                                style={{ width: `${wasteMetrics?.wasteRiskPercentage || 0}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-theme-muted mt-1">Waste Risk Level: {wasteMetrics?.wasteRiskPercentage || 0}%</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
