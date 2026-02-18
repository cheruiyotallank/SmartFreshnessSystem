import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaLeaf, FaCogs, FaChartBar, FaBoxes, FaSignOutAlt, FaUsers, FaBell, FaTag, FaSun, FaMoon, FaFilePdf } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin = user?.roles === "ROLE_ADMIN";

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md font-medium ${isActive ? "bg-green-600 text-white" : "text-theme-secondary hover:bg-green-100 dark:hover:bg-green-900/30"
    }`;

  return (
    <div className="min-h-screen flex bg-theme-secondary">
      <aside className="w-64 bg-theme-sidebar shadow-lg p-6 fixed top-0 left-0 h-full overflow-y-auto border-r border-theme">
        <div className="flex items-center gap-2 mb-6">
          <FaLeaf className="text-2xl text-green-600" />
          <h1 className="text-lg font-bold text-theme-primary">Smart System</h1>
        </div>
        <nav className="flex flex-col gap-3">
          <NavLink to="/dashboard" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/dashboard/freshness" className={linkClass}>
            <FaLeaf className="inline mr-2" /> Real-Time Freshness
          </NavLink>
          <NavLink to="/dashboard/devices" className={linkClass}>
            <FaCogs className="inline mr-2" /> Device Management
          </NavLink>
          <NavLink to="/dashboard/inventory" className={linkClass}>
            <FaChartBar className="inline mr-2" /> Inventory Reports
          </NavLink>
          <NavLink to="/dashboard/pricing" className={linkClass}>
            <FaBoxes className="inline mr-2" /> Pricing Rules
          </NavLink>

          {/* Admin-only links */}
          {isAdmin && (
            <>
              <div className="border-t border-theme my-2"></div>
              <p className="text-xs text-theme-muted uppercase font-semibold px-2">Admin</p>
              <NavLink to="/dashboard/products" className={linkClass}>
                <FaTag className="inline mr-2" /> Products
              </NavLink>
              <NavLink to="/dashboard/alerts" className={linkClass}>
                <FaBell className="inline mr-2" /> Alerts
              </NavLink>
              <NavLink to="/dashboard/analytics" className={linkClass}>
                <FaChartBar className="inline mr-2" /> Analytics
              </NavLink>
              <NavLink to="/dashboard/reports" className={linkClass}>
                <FaFilePdf className="inline mr-2" /> PDF Reports
              </NavLink>
              <NavLink to="/dashboard/users" className={linkClass}>
                <FaUsers className="inline mr-2" /> User Management
              </NavLink>
              <NavLink to="/dashboard/admin" className={linkClass}>
                <FaCogs className="inline mr-2" /> Admin Dashboard
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      <div className="flex-1 ml-64 flex flex-col">
        <header className="bg-theme-header shadow-theme px-6 py-4 flex justify-between items-center fixed top-0 left-64 right-0 z-10 border-b border-theme">
          <h2 className="text-3xl font-bold text-green-800 dark:text-green-400 italic">
            Freshness System Dashboard
          </h2>
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-theme-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <FaSun className="text-xl text-yellow-400" />
              ) : (
                <FaMoon className="text-xl text-gray-600" />
              )}
            </button>

            {isAdmin && (
              <NavLink
                to="/dashboard/alerts"
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600"
              >
                <FaBell /> Alerts
              </NavLink>
            )}
            <div className="text-right">
              <p className="text-theme-muted">👋 Welcome, {user?.name || "User"}!</p>
              <button
                onClick={handleLogout}
                className="mt-1 flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 mt-24 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
