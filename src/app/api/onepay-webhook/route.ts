import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { status, additional_data } = body;
    let orderReference;

    try {
      // Handle single-quote JSON strings by replacing with double quotes
      const parsedData = additional_data
        ? JSON.parse(additional_data.replace(/'/g, '"'))
        : null;

      orderReference = parsedData?.order_reference;

      if (!orderReference) {
        throw new Error("Order reference not found in additional_data");
      }
    } catch (error) {
      console.error(
        "Error retrieving order reference:",
        (error as Error).message
      );
      orderReference = null;
    }

    // Log each webhook hit in the webhook_logs table
    const { error: logError } = await supabase.from("webhook_logs").insert([
      {
        status,
        order_reference: orderReference || "N/A", // Default if orderReference is null
        data: body,
      },
    ]);

    if (logError) {
      console.error("Error logging webhook:", logError.message);
    } else {
    }

    // Validate payload
    if (!orderReference || typeof status !== "number") {
      console.error("Invalid payload:", body);
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    // Map status code to order status
    let orderStatus = "failed";
    if (status === 1) {
      orderStatus = "Confirmed";
    } else if (status === 1001) {
      orderStatus = "pending";
    }
    // Add more status mappings as needed

    // Update the order status in Supabase
    const { error } = await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("referenceId", orderReference);

    if (error) {
      console.error("Error updating order status:", error.message);
      return NextResponse.json(
        { message: "Database update failed" },
        { status: 500 }
      );
    }

    // Respond to acknowledge receipt
    return NextResponse.json(
      { message: `Order ${orderReference} status updated` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in webhook handler:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
