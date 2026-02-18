import React from "react";
import { FaBoxes, FaPercentage, FaClock, FaUsers } from "react-icons/fa";

const stats = [
    {
        icon: FaBoxes,
        value: "500+",
        label: "Units Monitored",
        description: "Active sensors tracking freshness"
    },
    {
        icon: FaPercentage,
        value: "40%",
        label: "Waste Reduction",
        description: "Average decrease in spoilage"
    },
    {
        icon: FaClock,
        value: "<1s",
        label: "Alert Speed",
        description: "Instant SMS notifications"
    },
    {
        icon: FaUsers,
        value: "50+",
        label: "Happy Clients",
        description: "Businesses trust our system"
    }
];

export default function Stats() {
    return (
        <section className="py-20 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-colors"
                        >
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <stat.icon className="text-3xl text-white" />
                            </div>
                            <p className="text-5xl font-bold text-white mb-2">{stat.value}</p>
                            <p className="text-lg font-semibold text-white/90">{stat.label}</p>
                            <p className="text-sm text-white/70 mt-1">{stat.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
