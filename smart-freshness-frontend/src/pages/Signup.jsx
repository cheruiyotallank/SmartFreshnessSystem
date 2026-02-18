import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useFormValidation } from "../hooks/useFormValidation";
import { validationRules } from "../utils/validation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const signupValidationRules = {
    name: validationRules.name,
    email: validationRules.email,
    password: validationRules.password,
    confirmPassword: validationRules.confirmPassword,
  };

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    isValid,
    passwordStrength,
    handleFieldChange,
    handleFieldBlur,
    validate,
    setIsSubmitting,
  } = useFormValidation(
    { name: "", email: "", password: "", confirmPassword: "" },
    signupValidationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    Object.keys(signupValidationRules).forEach((field) => {
      handleFieldBlur(field);
    });

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signup(formData.name, formData.email, formData.password);
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-100 via-white to-green-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-green-100 text-3xl">
            🌿
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center text-green-700 mb-6">
          SIGN UP
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              onBlur={() => handleFieldBlur("name")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                touched.name && errors.name
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-green-400"
              }`}
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => handleFieldBlur("email")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                touched.email && errors.email
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
                className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                  touched.password && errors.password
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
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                onBlur={() => handleFieldBlur("confirmPassword")}
                className={`w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                  touched.confirmPassword && errors.confirmPassword
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-green-400"
                }`}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword[0]}</p>
            )}
          </div>



          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center ${
              isSubmitting || !isValid
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
