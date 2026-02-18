/**
 * API Base URL Configuration
 * 
 * In development: Uses http://localhost:8080
 * In production: Uses VITE_API_URL environment variable
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default API_BASE_URL;
