import React from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaLinkedin, FaTwitter, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Reduce Waste & Increase Profits?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join businesses that trust Smart Freshness for their inventory management.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-xl hover:bg-gray-100 shadow-xl transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <FaLeaf className="text-xl text-white" />
              </div>
              <span className="text-xl font-bold text-white">Smart Freshness</span>
            </Link>
            <p className="text-gray-400 mb-6">
              IoT-powered freshness monitoring for perishable goods. Track, manage, and optimize your inventory.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <FaLinkedin />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="hover:text-green-400 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-green-400 transition-colors">How It Works</a></li>
              <li><a href="#testimonials" className="hover:text-green-400 transition-colors">Testimonials</a></li>
              <li><Link to="/login" className="hover:text-green-400 transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-green-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Support</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-green-500" />
                <span>allancheruiyot69@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-green-500" />
                <span>+254 742 470 479</span>
                <span>+254 725 927 986</span>
                <span>+254 729 820 712</span>

              </li>
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-green-500" />
                <span>Eldoret, Kenya</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Smart Freshness System. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Powered by <span className="text-green-400 font-medium">Koley, Allan & Nora</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
