"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/authContext";
import { formatCurrency } from "@/utils";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    offerVariation: { img_url: string }[];
  };
  vendor_id: {
    company_name: string;
  };
}

interface Customer {
  name: string;
  address: string;
  phone_no: string;
  email: string;
}

interface Order {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  referenceId: string;
  ship_address: string;
  payment_method: string;
  customer: Customer;
  orderItems: OrderItem[];
}

const OrdersPage: React.FC = () => {
  const { userDetails, isLoggedIn, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const router = useRouter();

  const pageSize = 10;

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      // Redirect to login if not logged in
      router.push("/login");
    } else if (isLoggedIn && userDetails) {
      fetchOrders(selectedStatus, currentPage);
      fetchStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, loading, userDetails, selectedStatus, currentPage]);

  const fetchOrders = async (status: string, page: number) => {
    try {
      setLoadingOrders(true);
      let query = supabase
        .from("orders")
        .select(
          "*,customer(*),orderItems(*,product(*,offerVariation(*)),vendor_id(*))",
          { count: "exact" }
        )
        .eq("ordered_by", userDetails?.id)
        .order("order_date", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (status !== "All") {
        query = query.eq("status", status);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        setErrorMessage("Failed to fetch orders. Please try again.");
        setLoadingOrders(false);
        return;
      }

      setOrders(data || []);
      setTotalOrders(count || 0);
      setLoadingOrders(false);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setLoadingOrders(false);
    }
  };

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("status")
        .eq("ordered_by", userDetails?.id);

      if (error) {
        console.error("Error fetching statuses:", error);
        return;
      }

      const statuses = Array.from(
        new Set(data.map((order: { status: string }) => order.status))
      );

      setAvailableStatuses(statuses);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  const handleNavigation = (route: string) => {
    if (!route) return;
    router.push(route);
  };

  const totalPages = Math.ceil(totalOrders / pageSize);

  const openCancelConfirmation = (order: Order) => {
    setOrderToCancel(order);
    setIsConfirmOpen(true);
  };

  const closeCancelConfirmation = () => {
    setOrderToCancel(null);
    setIsConfirmOpen(false);
  };

  const cancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "Canceled" })
        .eq("id", orderToCancel.id);

      if (error) {
        console.error("Error cancelling order:", error);
        setErrorMessage("Failed to cancel the order. Please try again.");
        closeCancelConfirmation();
        return;
      }

      // Optimistically update the UI
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderToCancel.id
            ? { ...order, status: "Canceled" }
            : order
        )
      );

      closeCancelConfirmation();
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      closeCancelConfirmation();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 lg:w-10/12">
      <h1 className="text-4xl font-bold mb-8 text-center">My Orders</h1>
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {errorMessage}
        </div>
      )}

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-8 justify-start">
        <button
          onClick={() => {
            setSelectedStatus("All");
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedStatus === "All"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {availableStatuses.map((status) => (
          <button
            key={status}
            onClick={() => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loadingOrders ? (
        <div className="flex justify-center items-center h-64">
          <Icon
            icon="mdi:loading"
            className="text-6xl text-gray-400 animate-spin"
          />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Icon
            icon="mdi:package-variant-closed"
            className="text-6xl text-gray-400 mb-4"
          />
          <p className="text-gray-600 text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-sm font-medium">
                    Order #{order.referenceId}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "Shipped"
                      ? "bg-blue-100 text-blue-700"
                      : order.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b pb-3"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {item.product.offerVariation[0]?.img_url ? (
                        <img
                          src={item.product.offerVariation[0].img_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <Icon icon="mdi:image-off" className="text-2xl" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Quantity: {item.quantity} | Price:{" "}
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total and Cancel Button */}
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm font-semibold">
                  Total: {formatCurrency(order.total_amount)}
                </p>
                {order.status == "Pending" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openCancelConfirmation(order);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmOpen && orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeCancelConfirmation}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-semibold mb-4">Cancel Order</h2>
            <p className="mb-4">
              Are you sure you want to cancel Order #{orderToCancel.referenceId}
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeCancelConfirmation}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                No, Go Back
              </button>
              <button
                onClick={cancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
