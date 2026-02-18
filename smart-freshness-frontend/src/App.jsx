import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Dashboard-related imports
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Home from "./pages/dashboard/Home";
import Freshness from "./pages/dashboard/Freshness";
import Devices from "./pages/dashboard/Devices";
import Inventory from "./pages/dashboard/Inventory";
import Pricing from "./pages/dashboard/Pricing";
import Users from "./pages/dashboard/Users";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Products from "./pages/dashboard/Products";
import Alerts from "./pages/dashboard/Alerts";
import Analytics from "./pages/dashboard/Analytics";
import Reports from "./pages/dashboard/Reports";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";

// Context is provided in main.jsx

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="freshness" element={<Freshness />} />
          <Route path="devices" element={<Devices />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="products" element={<Products />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="users" element={<Users />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </>
  );
}