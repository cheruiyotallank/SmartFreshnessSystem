import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import API_BASE_URL from "../../config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Papa from "papaparse";
import toast from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Inventory() {
  const [readings, setReadings] = useState([]);
  const [units, setUnits] = useState([]);
  const [unitId, setUnitId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last 7 days
    return date.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 16);
  });
  const [useDateFilter, setUseDateFilter] = useState(false);

  // Fetch units for dropdown
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/units`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch units");
        const data = await res.json();
        setUnits(data);
        if (data.length > 0 && !unitId) {
          setUnitId(data[0].id);
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      }
    };
    fetchUnits();
  }, []);

  // Fetch readings when unit or date range changes
  useEffect(() => {
    if (!unitId) return;

    const fetchReadings = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/api/freshness/readings/${unitId}`;

        if (useDateFilter && startDate && endDate) {
          url = `${API_BASE_URL}/api/freshness/readings/${unitId}/range?start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`;
        }

        const res = await fetch(url, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch readings");
        const data = await res.json();
        setReadings(data.data || []);
        setError("");
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, [unitId, useDateFilter, startDate, endDate]);

  const chartData = {
    labels: readings.map((r) => new Date(r.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "VOC (ppm)",
        data: readings.map((r) => r.voc),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        fill: true,
      },
      {
        label: "Temperature (°C)",
        data: readings.map((r) => r.temperature),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: true,
      },
      {
        label: "Humidity (%)",
        data: readings.map((r) => r.humidity),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        fill: true,
      },
      {
        label: "Freshness Score",
        data: readings.map((r) => r.freshnessScore),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        fill: true,
      },
    ],
  };

  const selectedUnit = units.find(u => u.id === unitId);
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Sensor Readings for ${selectedUnit?.name || 'Unit ' + unitId}` },
    },
    scales: { y: { beginAtZero: true } },
  };

  const handleExport = () => {
    const csv = Papa.unparse({
      fields: ["Timestamp", "VOC (ppm)", "Temperature (°C)", "Humidity (%)", "Freshness Score", "Price"],
      data: readings.map((r) => [
        r.timestamp,
        r.voc,
        r.temperature,
        r.humidity,
        r.freshnessScore,
        r.computedPrice,
      ]),
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_unit_${unitId}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully!");
  };

  if (loading && readings.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section>
      <h3 className="text-2xl font-bold mb-4">Inventory Reports</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Unit Selector */}
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">Select Unit</label>
            <select
              value={unitId || ""}
              onChange={(e) => setUnitId(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none border-gray-300 focus:ring-green-400"
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name || `Unit ${unit.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useDateFilter}
                onChange={(e) => setUseDateFilter(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-gray-700">Filter by date range</span>
            </label>
          </div>

          {/* Date Inputs */}
          {useDateFilter && (
            <>
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none border-gray-300 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 text-sm font-medium">End Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none border-gray-300 focus:ring-green-400"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart and Export */}
      <div className="bg-white p-6 rounded-lg shadow">
        {readings.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No readings available for the selected filters
          </p>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Showing {readings.length} readings
            </div>
            <Line data={chartData} options={options} />
            <button
              onClick={handleExport}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Export to CSV
            </button>
          </>
        )}
      </div>
    </section>
  );
}