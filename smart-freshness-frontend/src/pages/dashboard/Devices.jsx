import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCircle, FaSync } from "react-icons/fa";
import API_BASE_URL from "../../config";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/devices`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch devices");
      const data = await res.json();
      setDevices(data);
      setError("");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Never";
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading && devices.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const onlineCount = devices.filter(d => d.online).length;
  const offlineCount = devices.length - onlineCount;

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Device Management</h3>
        <button
          onClick={fetchDevices}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-gray-800">{devices.length}</p>
          <p className="text-gray-500">Total Devices</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-green-600">{onlineCount}</p>
          <p className="text-gray-500">Online</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-red-600">{offlineCount}</p>
          <p className="text-gray-500">Offline</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Device ID</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Location</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-600">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-3 text-sm text-gray-700 text-center">
                  No devices registered yet
                </td>
              </tr>
            )}
            {devices.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700 font-mono">{d.deviceId}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.name || "Unnamed"}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`flex items-center gap-2 ${d.online ? "text-green-600" : "text-red-500"}`}>
                    <FaCircle className="text-xs" />
                    {d.online ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.location || "Unknown"}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatLastSeen(d.lastSeen)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}