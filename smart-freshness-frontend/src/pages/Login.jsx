import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useFormValidation } from "../hooks/useFormValidation";
import { validationRules } from "../utils/validation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Removed loginType logic as it's now handled by backend roles

  const loginValidationRules = {
    email: validationRules.email,
    password: {
      ...validationRules.password,
      message: "Password is required",
    },
  };

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    validate,
    setIsSubmitting,
  } = useFormValidation(
    { email: "", password: "" },
    loginValidationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    Object.keys(loginValidationRules).forEach((field) => {
      handleFieldBlur(field);
    });

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 text-3xl">
            🔑
          </div>
        </div>

        <h2 className="text-3xl font-extrabold mb-6 text-center text-green-700">
          LOGIN
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => handleFieldBlur("email")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${touched.email && errors.email
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-400"
                }`}
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={() => handleFieldBlur("password")}
                className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${touched.password && errors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-green-400"
                  }`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center ${isSubmitting || !isValid
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-600 font-medium hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}