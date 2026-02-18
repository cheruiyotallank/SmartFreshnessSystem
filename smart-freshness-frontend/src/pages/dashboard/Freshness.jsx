import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import toast from "react-hot-toast";
import API_BASE_URL from "../../config";

export default function Freshness() {
  const [overview, setOverview] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitId, setUnitId] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const clientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Fetch units for dropdown
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/units`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch units");
        const data = await res.json();
        setUnits(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  // Fetch initial overview for selected unit
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/freshness/overview/${unitId}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch overview");
        const data = await res.json();
        if (data.status === "success") {
          setOverview(data.data);
        } else {
          throw new Error(data.message || "No data available");
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (units.length > 0) fetchOverview();
  }, [unitId, units]);

  // WebSocket with STOMP for real-time updates
  useEffect(() => {
    const connect = () => {
      const sock = new SockJS(`${API_BASE_URL}/ws`, null, {
        timeout: 5000,
        transports: ["websocket", "xhr-streaming", "xhr-polling"],
      });
      const client = new Client({
        webSocketFactory: () => sock,
        debug: (str) => console.log("STOMP Debug:", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });
      clientRef.current = client;

      client.onConnect = () => {
        console.log("Connected to WebSocket ✅");
        setError("");
        client.subscribe(`/topic/freshness/${unitId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("WebSocket message received:", data);
            setOverview(data);
            if (data.latestFreshnessScore < 60) {
              toast.error(
                `Alert: Low freshness (${data.latestFreshnessScore}%) for ${data.productName || "Unit"}!`,
                { id: `low-freshness-${unitId}` }
              );
            }
          } catch (err) {
            console.error("WebSocket message parse error:", err);
            toast.error("Failed to process WebSocket message");
          }
        });
      };

      client.onStompError = (frame) => {
        console.error("STOMP error:", frame);
        setError("WebSocket connection failed. Reconnecting...");
        toast.error("WebSocket connection failed. Reconnecting...");
      };

      client.onWebSocketClose = () => {
        console.log("WebSocket disconnected");
        setError("WebSocket disconnected. Reconnecting...");
        toast.error("WebSocket disconnected. Reconnecting...");
      };

      client.activate();

      return () => {
        if (clientRef.current && clientRef.current.connected) {
          clientRef.current.deactivate();
          console.log("WebSocket disconnected");
        }
      };
    };

    connect();

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.deactivate();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [unitId]);

  if (loading || !overview) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section>
      <h3 className="text-2xl font-bold mb-4">Freshness Overview</h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Select Unit</label>
        <select
          value={unitId}
          onChange={(e) => setUnitId(Number(e.target.value))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors border-gray-300 focus:ring-green-400"
        >
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name || `Unit ${unit.id}`}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <h4 className="font-semibold">Freshness Score</h4>
          <p className="text-4xl font-bold text-green-600 mt-3">
            {overview.latestFreshnessScore ?? "N/A"}%
          </p>
          <p className="text-sm text-gray-500 mt-2">Real-time monitoring</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <h4 className="font-semibold">Current Price</h4>
          <p className="text-4xl font-bold text-green-600 mt-3">
            ${overview.currentPrice?.toFixed(2) ?? "0.00"}
          </p>
          <p className="text-sm text-gray-500 mt-2">Updated dynamically</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <h4 className="font-semibold">Inventory Status</h4>
          <p className="text-4xl font-bold text-green-600 mt-3">
            {overview.inventoryCount ?? 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">Items in stock</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <h4 className="font-semibold">VOC Level</h4>
          <p className="text-3xl font-bold text-blue-600 mt-3">
            {overview.voc?.toFixed(2) ?? "N/A"}
          </p>
          <p className="text-sm text-gray-500 mt-2">Volatile compounds</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <h4 className="font-semibold">Temperature</h4>
          <p className="text-3xl font-bold text-red-600 mt-3">
            {overview.temperature?.toFixed(1) ?? "N/A"} °C
          </p>
          <p className="text-sm text-gray-500 mt-2">Current temperature</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow text-center">
          <h4 className="font-semibold">Humidity</h4>
          <p className="text-3xl font-bold text-indigo-600 mt-3">
            {overview.humidity?.toFixed(1) ?? "N/A"} %
          </p>
          <p className="text-sm text-gray-500 mt-2">Current humidity</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow text-center col-span-1 md:col-span-3">
          <h4 className="font-semibold">Last Update</h4>
          <p className="text-lg font-medium text-gray-700 mt-3">
            {overview.latestReadingTimestamp
              ? new Date(overview.latestReadingTimestamp).toLocaleString()
              : "N/A"}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow text-center col-span-1 md:col-span-3">
          <h4 className="font-semibold">Status</h4>
          <p
            className={`text-2xl font-bold mt-3 ${overview.latestFreshnessScore > 70
              ? "text-green-600"
              : overview.latestFreshnessScore > 40
                ? "text-yellow-500"
                : "text-red-600"
              }`}
          >
            {overview.latestFreshnessScore > 70
              ? "Fresh"
              : overview.latestFreshnessScore > 40
                ? "Moderate"
                : "Spoiling"}
          </p>
          <p className="text-sm text-gray-500 mt-2">Health indicator</p>
        </div>
      </div>
    </section>
  );
}