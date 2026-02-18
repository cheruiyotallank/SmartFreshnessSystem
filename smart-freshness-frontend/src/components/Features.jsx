import React from "react";
import {
    FaThermometerHalf,
    FaChartLine,
    FaBell,
    FaMoneyBillWave,
    FaFileAlt,
    FaMobileAlt,
    FaLeaf,
    FaTint
} from "react-icons/fa";

const features = [
    {
        icon: FaLeaf,
        title: "Real-Time Freshness",
        description: "Monitor freshness scores instantly with IoT sensors detecting VOC levels, temperature, and humidity.",
        color: "from-green-400 to-green-600"
    },
    {
        icon: FaThermometerHalf,
        title: "Environmental Tracking",
        description: "Track temperature and humidity levels 24/7 to ensure optimal storage conditions.",
        color: "from-blue-400 to-blue-600"
    },
    {
        icon: FaMoneyBillWave,
        title: "Dynamic Pricing",
        description: "Automatic price adjustments based on freshness scores to maximize revenue and minimize waste.",
        color: "from-emerald-400 to-emerald-600"
    },
    {
        icon: FaBell,
        title: "Instant SMS Alerts",
        description: "Receive immediate notifications when freshness drops below your configured threshold.",
        color: "from-orange-400 to-orange-600"
    },
    {
        icon: FaChartLine,
        title: "Analytics Dashboard",
        description: "Comprehensive charts showing trends, waste metrics, and alert frequency over time.",
        color: "from-purple-400 to-purple-600"
    },
    {
        icon: FaFileAlt,
        title: "PDF Reports",
        description: "Generate professional inventory and freshness reports for record-keeping and analysis.",
        color: "from-pink-400 to-pink-600"
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Features</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-3 mb-4">
                        Everything You Need to
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"> Monitor Freshness</span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        A complete IoT solution for tracking, managing, and optimizing your perishable inventory.
                    </p>
                </div>

                {/* Features grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 border border-transparent hover:border-green-100"
                        >
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                <feature.icon className="text-2xl text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
