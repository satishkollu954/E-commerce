// src/components/FitFusionSuccessPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export function FitFusionSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center transform transition-all hover:scale-105">
        <div className="flex justify-center">
          <CheckCircle className="w-24 h-24 text-green-500 animate-bounce" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-800 mt-6 mb-4">
          🎉 Order Placed Successfully!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Thank you for shopping with{" "}
          <span className="font-semibold">FitFusion</span>. A confirmation email
          has been sent to your registered email.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-3 bg-dark text-white text-lg font-medium rounded-full shadow-md hover:bg-green-600 hover:shadow-lg transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
