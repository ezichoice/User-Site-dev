"use client";
import React from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

const OrderSuccessPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-10 text-center max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <Icon
            icon="mdi:check-circle-outline"
            className="text-green-500"
            width="100"
            height="100"
          />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-600 mb-8">
          Your order has been placed, and you’ll receive a confirmation from the
          merchant soon. Thank you for shopping with us!
        </p>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition duration-150"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
