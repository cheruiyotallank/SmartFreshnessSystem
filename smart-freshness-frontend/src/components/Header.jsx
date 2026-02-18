import React from "react";
import { Link } from "react-router-dom";
import { FaLeaf } from "react-icons/fa";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform">
            <FaLeaf className="text-xl text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
            Smart Freshness
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-gray-600">
          <a href="#features" className="hover:text-green-600 transition-colors font-medium">Features</a>
          <a href="#how-it-works" className="hover:text-green-600 transition-colors font-medium">How It Works</a>
          <a href="#testimonials" className="hover:text-green-600 transition-colors font-medium">Testimonials</a>
          <a href="#contact" className="hover:text-green-600 transition-colors font-medium">Contact Us</a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}