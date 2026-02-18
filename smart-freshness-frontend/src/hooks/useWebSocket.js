import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API_BASE_URL from "../config";

export default function useWebSocket(unitId) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const wsUrl = API_BASE_URL.replace(/^http/, "ws");
    const ws = new WebSocket(`${wsUrl}/ws/freshness/${unitId}`);

    ws.onopen = () => {
      console.log("Connected to WebSocket ✅");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessage(data);
      if (data.latestFreshnessScore < 60) {
        toast.error(
          `Alert: Low freshness (${data.latestFreshnessScore}%) for ${data.productName || "Unit"}!`,
          { id: `low-freshness-${unitId}` }
        );
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("WebSocket connection failed");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [unitId]);

  return message;
}