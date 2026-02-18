import React from "react";
import { FaMicrochip, FaMobileAlt, FaShieldAlt } from "react-icons/fa";

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-bold mb-4">System Functionality</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow">
            <FaMicrochip className="text-green-600 text-2xl mb-3" />
            <h4 className="font-semibold">MQ-135 Sensor</h4>
            <p className="text-gray-600 mt-2">Detects VOCs released by produce to compute freshness scores.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            <FaMobileAlt className="text-green-600 text-2xl mb-3" />
            <h4 className="font-semibold">ESP32 & Edge</h4>
            <p className="text-gray-600 mt-2">Wi-Fi microcontroller pushes sensor data to the web app.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            <FaShieldAlt className="text-green-600 text-2xl mb-3" />
            <h4 className="font-semibold">Dynamic Pricing</h4>
            <p className="text-gray-600 mt-2">Automated markdowns reduce waste and increase salvage revenue.</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold mb-4">Demo Working Video</h3>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="bg-gray-200 aspect-video flex items-center justify-center rounded">
            <span className="text-gray-500">Demo video in action</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">Demo video of the working Smart Freshness System</p>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold mb-4">Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl shadow">
            <h4 className="font-semibold mb-2">Inventory Tips</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Rotate stock daily to keep fresh items at the front.</li>
              <li>Use smaller crates to reduce spoilage clusters.</li>
              <li>Tag products with freshness scores for easy sorting.</li>
            </ul>
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            <h4 className="font-semibold mb-2">Pricing Strategy</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Discount products below 60% freshness.</li>
              <li>Bundle near-expiry items with fresh ones for better sales.</li>
              <li>Use AI-based markdowns during peak hours.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}