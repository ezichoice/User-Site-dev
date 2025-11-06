"use client";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { useReactToPrint } from "react-to-print";

interface OrderDetails {
  id: string;
  order_date: string;
  status: string;
  total_amount: number;
  ship_address: string;
  customer: string;
  payment_method: string;
  referenceId: string;
}

interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export default function CheckoutSuccess({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Extract orderId from searchParams safely
  const orderIdParam = searchParams.orderId;
  const orderId =
    typeof orderIdParam === "string"
      ? orderIdParam
      : Array.isArray(orderIdParam) && orderIdParam.length > 0
      ? orderIdParam[0]
      : undefined;

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID.");
      return;
    }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        setError("Error fetching order details.");
      } else if (data) {
        setOrderDetails(data);
      }
    };

    fetchOrder();
  }, [orderId]);

  interface CustomUseReactToPrintOptions
    extends Omit<Parameters<typeof useReactToPrint>[0], "content"> {
    content: () => HTMLDivElement | null;
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  } as CustomUseReactToPrintOptions);

  const handleDownloadPDF = () => {
    if (!orderDetails) {
      return;
    }
    const doc = new jsPDF();
    doc.text("Invoice", 20, 20);
    doc.text(`Order ID: ${orderDetails.id}`, 20, 30);
    doc.text(
      `Order Date: ${new Date(orderDetails.order_date).toLocaleString()}`,
      20,
      40
    );
    doc.text(`Status: ${orderDetails.status}`, 20, 50);
    doc.text(
      `Total Amount: LKR ${orderDetails.total_amount.toLocaleString()}`,
      20,
      60
    );
    doc.text(`Shipping Address: ${orderDetails.ship_address}`, 20, 70);
    doc.text(`Customer ID: ${orderDetails.customer}`, 20, 80);
    doc.text(`Payment Method: ${orderDetails.payment_method}`, 20, 90);
    doc.text(`Reference ID: ${orderDetails.referenceId}`, 20, 100);
    doc.save("Order_Invoice.pdf");
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-red-500">{error}</div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto py-8 px-4 text-gray-500">
        Loading order details...
      </div>
    );
  }

  const statusStyle =
    orderDetails.status === "Pending"
      ? "text-yellow-500 bg-yellow-100"
      : "text-green-500 bg-green-100";

  return (
    <div className="container mx-auto py-12 px-6">
      <div
        className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto border border-gray-200"
        ref={componentRef}
      >
        <header className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Invoice</h2>
          <p className="text-sm text-gray-600">Thank you for your purchase!</p>
        </header>

        <div className="mb-6 border-b pb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Order ID:</span>
            <span className="font-medium">{orderDetails.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Order Date:</span>
            <span className="font-medium">
              {new Date(orderDetails.order_date).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Status:</span>
            <span className={`font-medium ${statusStyle} px-2 py-1 rounded`}>
              {orderDetails.status}
            </span>
          </div>
        </div>

        <section className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Billing Information
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Customer ID:</span>
            <span className="font-medium">{orderDetails.customer}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Payment Method:</span>
            <span className="font-medium">{orderDetails.payment_method}</span>
          </div>
        </section>

        <section className="mb-6 border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Shipping Information
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Shipping Address:</span>
            <span className="font-medium">{orderDetails.ship_address}</span>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Order Summary
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Total Amount:</span>
            <span className="font-medium">
              LKR {orderDetails.total_amount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Reference ID:</span>
            <span className="font-medium">{orderDetails.referenceId}</span>
          </div>
        </section>

        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => handlePrint()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Print Invoice
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
