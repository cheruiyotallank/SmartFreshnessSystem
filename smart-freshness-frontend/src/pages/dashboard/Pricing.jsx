import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API_BASE_URL from "../../config";

export default function Pricing() {
  const [units, setUnits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section>
      <h3 className="text-2xl font-bold mb-4">Pricing Rules</h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        {units.length === 0 && <p className="text-gray-600">No units available</p>}
        {units.map((unit) => (
          <div key={unit.id} className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{unit.name || "Unnamed Unit"}</h4>
              <p className="text-sm text-gray-500">
                Current Price: ${unit.currentPrice?.toFixed(2) || "N/A"}
              </p>
            </div>
            <div className="text-sm text-green-600 font-semibold">
              {unit.currentPrice && unit.product?.basePrice
                ? unit.currentPrice < unit.product.basePrice
                  ? "Discounted"
                  : "Full Price"
                : "N/A"}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow space-y-4"> Pricing rules:
        <h1>Discount products below 60% freshness.</h1>
      </div>
    </section>
  );
}