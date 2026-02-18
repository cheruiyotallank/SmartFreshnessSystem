import React from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaChartLine, FaBell, FaArrowRight } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FaLeaf className="absolute top-20 left-[10%] text-4xl text-green-300 animate-bounce" style={{ animationDuration: "3s" }} />
        <FaChartLine className="absolute top-40 right-[15%] text-3xl text-emerald-300 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }} />
        <FaBell className="absolute bottom-40 left-[20%] text-3xl text-green-300 animate-bounce" style={{ animationDuration: "2.8s", animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          IoT-Powered Freshness Monitoring
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <span className="text-gray-800">Keep Your Products</span>
          <br />
          <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent">
            Fresh & Profitable
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Real-time IoT monitoring for perishable goods. Track temperature, humidity,
          and freshness scores with <span className="text-green-600 font-semibold">dynamic pricing</span> and
          <span className="text-green-600 font-semibold"> instant SMS alerts</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/signup"
            className="group px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-green-700 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all flex items-center gap-2"
          >
            Start Monitoring Now
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all"
          >
            View Dashboard
          </Link>
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600">98%</p>
            <p className="text-gray-500 text-sm mt-1">Accuracy Rate</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600">40%</p>
            <p className="text-gray-500 text-sm mt-1">Less Waste</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600">24/7</p>
            <p className="text-gray-500 text-sm mt-1">Monitoring</p>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
