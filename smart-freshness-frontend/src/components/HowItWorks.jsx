import React from "react";
import { FaPlug, FaDesktop, FaBell, FaChartPie } from "react-icons/fa";

const steps = [
    {
        icon: FaPlug,
        step: "01",
        title: "Connect Sensors",
        description: "Install IoT sensors on your storage units. Our system supports various sensor types for temperature, humidity, and VOC detection."
    },
    {
        icon: FaDesktop,
        step: "02",
        title: "Monitor Real-Time",
        description: "Access your dashboard to view live freshness scores, environmental data, and pricing updates from anywhere."
    },
    {
        icon: FaBell,
        step: "03",
        title: "Receive Alerts",
        description: "Get instant SMS notifications when freshness drops below your threshold, enabling quick action."
    },
    {
        icon: FaChartPie,
        step: "04",
        title: "Reduce Waste",
        description: "Use analytics and dynamic pricing to sell products before they spoil, maximizing profit and reducing waste."
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-green-50">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">How It Works</span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mt-3 mb-4">
                        Get Started in
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"> 4 Easy Steps</span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        From installation to insights, our system makes freshness monitoring simple and effective.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-green-300 to-transparent"></div>
                            )}

                            <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-green-100">
                                {/* Step number */}
                                <span className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white font-bold rounded-full flex items-center justify-center text-sm shadow-lg">
                                    {step.step}
                                </span>

                                {/* Icon */}
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                    <step.icon className="text-3xl text-green-600" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-3">{step.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
