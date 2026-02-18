import React, { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import API_BASE_URL from "../config";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (name, email, password, adminCode = "") => {
    try {
      console.log("Signup attempt:", { name, email, adminCode });
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, adminCode }),
      });
      console.log("Signup response status:", res.status);
      if (!res.ok) {
        const err = await res.text();
        console.error("Signup error:", err);
        throw new Error(err || "Signup failed");
      }
      const data = await res.json();
      console.log("Signup success:", data);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Account created successfully!");
      return data;
    } catch (error) {
      console.error("Signup catch error:", error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Login attempt:", { email, password });
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("Login response status:", res.status, "OK:", res.ok);
      if (!res.ok) {
        const err = await res.text();
        console.error("Login error:", err);
        throw new Error(err || "Login failed");
      }
      const data = await res.json();
      console.log("Login success:", data);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Login successful!");
      return data;
    } catch (error) {
      console.error("Login catch error:", error.message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}