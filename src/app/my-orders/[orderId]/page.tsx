"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/authContext";
import { formatCurrency } from "@/utils";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Product } from "@/app/modals/Product";

interface Offer {
  name: string;
  img_url: string;
  offer_price: number;
}

interface Vendor {
  company_name: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  product: Product;
  vendor_id: Vendor;
  price: number;
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
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true); // New loading state
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (loading) return; // Wait until loading state is resolved
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    if (isLoggedIn && userDetails && orders.length === 0) {
      // Fetch orders only if the user is logged in and orders are not already fetched
      fetchOrders();
    }
  }, [isLoggedIn, loading, userDetails, orders.length]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true); // Start loading
      const { data, error } = await supabase
        .from("orders")
        .select(
          "*,customer(*),orderItems(*,product(*,offerVariation(*)),vendor_id(*))"
        )
        .eq("id", params?.orderId);

      if (error) {
        console.error("Error fetching orders:", error);
        setErrorMessage("Failed to fetch orders. Please try again.");
        setLoadingOrders(false); // Stop loading
        return;
      }

      setOrders(data || []);
      setLoadingOrders(false); // Stop loading
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setLoadingOrders(false); // Stop loading
    }
  };

  const getStatusBadge = (status: string) => {
    let color = "";
    switch (status.toLowerCase()) {
      case "pending":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "shipped":
        color = "bg-blue-100 text-blue-800";
        break;
      case "delivered":
        color = "bg-green-100 text-green-800";
        break;
      case "cancelled":
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto py-12 px-4 lg:w-10/12">
      {errorMessage && (
        <div className="text-red-500 mb-4 text-center">{errorMessage}</div>
      )}
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
          <p className="text-gray-600 text-lg">You have no orders yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                <h2 className="text-3xl font-semibold mb-2 text-center">
                  Thank you for your order!
                </h2>
                <p className="text-center">
                  Hi {userDetails?.name || "Customer"},
                </p>
                <p className="mt-4 text-center">
                  Your order{" "}
                  <span className="font-bold">#{order.referenceId}</span> has
                  been placed successfully. We&apos;ll notify you once your
                  package is on its way.
                </p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Order Details</h3>
                  {getStatusBadge(order.status)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      Delivery Details
                    </h4>
                    <div className="text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {order.customer.name}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {order.customer.address}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {order.customer.phone_no}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {order.customer.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">
                      Payment Details
                    </h4>
                    <div className="text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium">Payment Method:</span>{" "}
                        {order.payment_method}
                      </p>
                      <p>
                        <span className="font-medium">Order Date:</span>{" "}
                        {new Date(order.order_date).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-medium">Total Amount:</span>{" "}
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Order Items</h4>
                  <div className="space-y-6">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row items-start md:items-center border-b pb-6"
                      >
                        <div className="flex-shrink-0 w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                          {item.product.offerVariation?.[0]?.img_url ? (
                            <img
                              src={item.product.offerVariation[0].img_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                              <Icon icon="mdi:image-off" className="text-4xl" />
                            </div>
                          )}
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6">
                          <h5 className="text-lg font-medium text-gray-800">
                            {item.product.name}
                          </h5>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              Quantity:{" "}
                              <span className="font-medium">
                                {item.quantity}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Price:{" "}
                              <span className="font-medium">
                                {formatCurrency(item.price)}
                              </span>
                            </p>

                            <p className="text-sm text-gray-600">
                              Vendor:{" "}
                              <span className="font-medium">
                                {item.vendor_id.company_name}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-6">
                    <div className="text-right">
                      <p className="text-gray-600">Subtotal:</p>
                      <p className="text-gray-800 font-bold text-xl mt-2">
                        Total:
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-gray-600">
                        {formatCurrency(order.total_amount)}
                      </p>
                      <p className="text-gray-800 font-bold text-xl mt-2">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
