"use client";
import React, { use, useEffect, useRef, useState } from "react";
import { useCart } from "@/context/cartContext";
import { useVendorContext } from "@/context/vendorContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import sha256 from "crypto-js/sha256";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils";
import { useAuth } from "@/context/authContext";
import { useSearchParams } from "next/navigation";
import {fetchVendorOption} from "../api/shipping"

interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PaymentDetails {
  amount: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone_number: string;
  customer_email: string;
  transaction_redirect_url: string;
}

const InputField = ({
  id,
  name,
  label,
  type = "text",
  formik,
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  formik: any;
  required?: boolean;
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-xs font-medium text-gray-700 mb-1"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      value={formik.values[name]}
      className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm ${
        formik.touched[name] && formik.errors[name]
          ? "border-red-500"
          : "border-gray-300"
      }`}
    />
    {formik.touched[name] && formik.errors[name] && (
      <p className="text-red-500 text-xs mt-1 flex items-center">
        <Icon icon="mdi:alert-circle" className="mr-1" /> {formik.errors[name]}
      </p>
    )}
  </div>
);

const generateTransactionReference = (): string => {
  const randomSixDigit = Math.floor(100000 + Math.random() * 900000).toString();
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${datePrefix}${randomSixDigit}`;
};

const ShippingDetailsPage: React.FC = () => {
  const transactionReference = useRef(generateTransactionReference());
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { getCompanyNamesByIds } = useVendorContext();
  const [vendorNames, setVendorNames] = useState<{ [key: string]: string }>({});
  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(true);
  const [cashpayment, setCashPayment] = useState(true);
  const [cardpayment, setCardPayment] = useState(true);
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { userDetails } = useAuth();

  const searchParams = useSearchParams();
  const selectedVendor = searchParams.get("vendorId");

  const [paymentMethod, setPaymentMethod] = useState<{ [key: string]: string }>(
    {}
  );
  const [orderType, setOrderType] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchVendorNames = async () => {
      const ids = Object.keys(cart);
      const names = await getCompanyNamesByIds(ids);
      if (isMounted) {
        setVendorNames(names);
      }
    };
    fetchVendorNames();
    return () => {
      isMounted = false;
    };
  }, [cart, getCompanyNamesByIds]);

  useEffect(() => {
    const fetchVendorOptions = async () => {
      const vendorOptions = await fetchVendorOption(selectedVendor);
      if (vendorOptions) {
        setDelivery(vendorOptions.delivery);
        setPickup(vendorOptions.storepickup);
        setCashPayment(vendorOptions.cash_on_delivery);
        setCardPayment(vendorOptions.cardpay);
      }
    };
    fetchVendorOptions();

  },[selectedVendor]);

  useEffect(() => {
    if (selectedVendor) {
      setPaymentMethod((prev) => ({
        ...prev,
        [selectedVendor]: "card",
      }));
      setOrderType("delivery");
    }
  }, [selectedVendor]);

  const getTotalPriceForSelectedVendor = () => {
    if (!selectedVendor || !cart[selectedVendor]) return 0;
    return cart[selectedVendor].reduce((total, item) => {
      const priceToUse =
        paymentMethod[selectedVendor] === "card" && item.offerPrice
          ? item.offerPrice
          : item.price;
      return total + priceToUse * item.quantity;
    }, 0);
  };

  const processPayment = async (paymentDetails: PaymentDetails) => {
    if (!selectedVendor || !cart[selectedVendor]) {
      setErrorMessage("No items found for the selected vendor.");
      return;
    }

    setProgressMessage("Saving your order details...");
    const selectedPaymentMethod = paymentMethod[selectedVendor];

    const orderId = await saveOrder(
      selectedPaymentMethod,
      transactionReference.current
    );

    if (!orderId) {
      setLoading(false);
      return;
    }

    if (selectedPaymentMethod === "card") {
      setProgressMessage("Processing payment...");
      // Define OnePay-specific variables
      const app_id = "3H5Q118E6902789AE2C14";
      const token =
        "1c36699f1d9eef0ba07c5438bad0d4d0634663793167f5c37ffbe7357b80281058ee073736e258e3.YEUS118E6EFC2DABCFF36";
      const hashSalt = "FMCF118E6902789AE2C48";

      const requestBody = {
        amount: paymentDetails.amount,
        app_id,
        reference: transactionReference.current,
        order_reference: transactionReference.current,
        customer_first_name: paymentDetails.customer_first_name,
        customer_last_name: paymentDetails.customer_last_name,
        customer_phone_number: paymentDetails.customer_phone_number,
        customer_email: paymentDetails.customer_email,
        transaction_redirect_url: `http://ezichoice.lk/checkout-success?orderId=${orderId}`,
        currency: "LKR",
        additional_data: { order_reference: transactionReference.current },
      };

      const hash = generateHash(requestBody, hashSalt);
      const url = `https://merchant-api-live-v2.onepay.lk/api/ipg/gateway/request-payment-link/?hash=${hash}`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        if (data.status === 1000) {
          window.location.href = data.data.gateway.redirect_url;
        } else {
          setErrorMessage("Payment request failed. Please try again.");
          setLoading(false);
        }
      } catch (error) {
        setErrorMessage("Error during payment processing. Please try again.");
        setLoading(false);
      }
    } else {
      setProgressMessage("Redirecting...");
      setLoading(false);
      router.push("/order-placed");
    }
  };

  const generateHash = (requestBody: Record<string, any>, hashSalt: string) => {
    const bodyString =
      JSON.stringify(requestBody).replace(/\s+/g, "") + hashSalt;
    return sha256(bodyString).toString();
  };

  const saveOrder = async (
    paymentMethod: string,
    refId: string
  ): Promise<string | null> => {
    try {
      setProgressMessage("Saving customer details...");
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: `${formik.values.firstName} ${formik.values.lastName}`,
          email: formik.values.email,
          phone_no: formik.values.phone,
          address: `${formik.values.addressLine1} ${
            formik.values.addressLine2 || ""
          }`,
        })
        .select();

      if (customerError) {
        throw new Error("Failed to save customer details.");
      }

      const customerId = customerData[0].id;

      setProgressMessage(`Saving order for vendor ${selectedVendor}...`);
      const vendorItems = cart[selectedVendor || "null"];
      const totalAmount = getTotalPriceForSelectedVendor();

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_date: new Date().toISOString(),
          status: "Pending",
          total_amount: totalAmount,
          referenceId: refId,
          ship_address: `${formik.values.addressLine1} ${
            formik.values.addressLine2 || ""
          }`,
          ordered_by: userDetails?.id,
          customer: customerId,
          payment_method: paymentMethod,
          vendor_id: selectedVendor,
          order_type: orderType,
        })
        .select();

      if (orderError) {
        throw new Error(`Failed to save order for vendor ${selectedVendor}.`);
      }

      const orderId = orderData[0].id;
      await saveOrderItems(orderId, vendorItems, paymentMethod);

      clearCart(selectedVendor || "null");
      return orderId;
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error(error);
      return null;
    }
  };

  const saveOrderItems = async (
    orderId: string,
    vendorItems: any[],
    paymentMethod: string
  ) => {
    try {
      for (const item of vendorItems) {
        const priceToUse =
          paymentMethod === "card" && item.offerPrice
            ? item.offerPrice
            : item.price;

        setProgressMessage(`Saving item ${item.name}...`);
        const { error } = await supabase.from("orderItems").insert({
          quantity: item.quantity,
          sub_total: item.quantity * priceToUse,
          order: orderId,
          product: item.productId,
          vendor_id: item.vendorId,
          price: priceToUse,
        });

        if (error) {
          throw new Error(`Failed to save order item: ${item.productId}`);
        }
      }
    } catch (error) {
      setErrorMessage("An error occurred while saving order items.");
      console.error(error);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postalCode: "",
      country: "",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("Required"),
      lastName: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email address").required("Required"),
      phone: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMessage("");
      setProgressMessage("Processing your order...");
      await processPayment({
        amount: getTotalPriceForSelectedVendor(),
        customer_first_name: values.firstName,
        customer_last_name: values.lastName,
        customer_phone_number: values.phone,
        customer_email: values.email,
        transaction_redirect_url: `http://ezichoice.lk/checkout-success`,
      });
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 md:w-9/12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            <Icon icon="mdi:clipboard-list" className="inline-block mr-2" />
            Order Summary
          </h2>
          <div className="space-y-4">
            {selectedVendor && cart[selectedVendor] ? (
              <div
                key={selectedVendor}
                className="border border-indigo-200 rounded-lg p-4 shadow-sm bg-indigo-50"
              >
                <h3 className="text-lg font-semibold mb-2 flex items-center text-indigo-700">
                  <Icon
                    icon="mdi:store"
                    className="text-indigo-500 mr-2"
                    width="20"
                    height="20"
                  />
                  {vendorNames[selectedVendor] || "Loading..."}
                </h3>
                <ul className="space-y-1">
                  {cart[selectedVendor].map((item) => (
                    <li
                      key={item.productId}
                      className="flex justify-between items-center text-xs text-teal-700"
                    >
                      <div className="flex items-center space-x-2">
                        {/* Product Image */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <span>{item.name}</span>
                      </div>
                      <span>
                        {item.quantity} x{" "}
                        <span className="font-medium">
                          {formatCurrency(
                            paymentMethod[selectedVendor] === "card" &&
                              item.offerPrice
                              ? item.offerPrice
                              : item.price
                          )}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <br />
                <div className="border border-indigo-200 rounded-lg p-4 shadow-sm bg-indigo-50">
                  <h3 className="text-sm font-semibold text-indigo-600 mb-2 flex items-center">
                    <Icon icon="mdi:credit-card-multiple" className="mr-1" />
                    Select Payment Method
                  </h3>
                  <div className="flex items-center gap-4">

                  {cardpayment && (
  <button
    type="button"
    className={`w-28 h-16 p-3 border rounded-lg flex flex-col items-center gap-1 transition-colors ${
      paymentMethod[selectedVendor] === "card"
        ? "border-indigo-500 bg-indigo-100 text-indigo-700"
        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
    }`}
    onClick={() =>
      setPaymentMethod((prev) => ({
        ...prev,
        [selectedVendor]: "card",
      }))
    }
  >
    <Icon icon="fxemoji:creditcard" height="40px" />
    <p className="text-xs">Card Payment</p>
  </button>
)}

                  { cashpayment && <button
                      type="button"
                      className={`w-28 h-16 p-3 border rounded-lg flex flex-col items-center gap-1 transition-colors ${
                        paymentMethod[selectedVendor] === "cash"
                          ? "border-indigo-500 bg-indigo-100 text-indigo-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() =>
                        setPaymentMethod((prev) => ({
                          ...prev,
                          [selectedVendor]: "cash",
                        }))
                      }
                    >
                      <Icon icon="flowbite:cash-solid" height="40px" />{" "}
                      {/* Adjusted size */}
                      <span className="text-xs font-medium">Cash Payment</span>
                    </button>}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-indigo-600 mb-2 flex items-center">
                      <Icon
                        icon="icon-park-outline:transaction-order"
                        className="mr-1"
                      />
                      Select Order Type
                    </h3>
                    <div className="flex items-center gap-4">
                      {delivery && <button
                        type="button"
                        className={`w-28 h-16 p-3 border rounded-lg flex flex-col items-center gap-1 transition-colors ${
                          orderType === "delivery"
                            ? "border-indigo-500 bg-indigo-100 text-indigo-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setOrderType("delivery")}
                      >
                        <Icon
                          icon="material-symbols:delivery-truck-speed-outline"
                          height="40px"
                        />{" "}
                        {/* Adjusted width */}
                        <p className="text-xs">Delivery</p>
                      </button>}
                      {pickup && <button
                        type="button"
                        className={`w-28 h-16 p-3 border rounded-lg flex flex-col items-center gap-1 transition-colors ${
                          orderType === "store pickup"
                            ? "border-indigo-500 bg-indigo-100 text-indigo-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => setOrderType("store pickup")}
                      >
                        <Icon icon="lsicon:picking-outline" height="40px" />{" "}
                        {/* Adjusted size */}
                        <p className="text-xs">Store Pickup</p>
                      </button>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-indigo-700">No items found for this vendor.</p>
            )}
          </div>
          <div className="mt-6 border-t border-indigo-300 pt-4 text-right">
            <h3 className="text-lg font-semibold text-indigo-800">
              Total:{" "}
              <span className="text-indigo-900">
                {formatCurrency(getTotalPriceForSelectedVendor())}
              </span>
            </h3>
          </div>
        </div>
        {/* Shipping Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            <Icon icon="mdi:shipping" className="inline-block mr-2" />
            Shipping Details
          </h2>
          {errorMessage && (
            <div className="flex items-center text-red-500 mb-4">
              <Icon icon="mdi:alert-circle" className="mr-2" />
              {errorMessage}
            </div>
          )}

          {/* Shipping Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="firstName"
                name="firstName"
                label="First Name"
                formik={formik}
                required
              />
              <InputField
                id="lastName"
                name="lastName"
                label="Last Name"
                formik={formik}
                required
              />
            </div>
            <InputField
              id="email"
              name="email"
              label="Email"
              type="email"
              formik={formik}
              required
            />
            <InputField
              id="phone"
              name="phone"
              label="Phone"
              type="tel"
              formik={formik}
              required
            />
            {orderType !== "store pickup" && (
              <>
                <InputField
                  id="addressLine1"
                  name="addressLine1"
                  label="Address Line 1"
                  formik={formik}
                  required
                />
                <InputField
                  id="addressLine2"
                  name="addressLine2"
                  label="Address Line 2"
                  formik={formik}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    id="city"
                    name="city"
                    label="City"
                    formik={formik}
                    required
                  />
                  <InputField
                    id="postalCode"
                    name="postalCode"
                    label="Postal Code"
                    formik={formik}
                    required
                  />
                </div>
                <InputField
                  id="country"
                  name="country"
                  label="Country"
                  formik={formik}
                  required
                />
              </>
            )}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 transition duration-200 flex justify-center items-center gap-2"
                disabled={loading}
              >
                {loading && (
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="10"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M50 5a45 45 0 0145 45H50V5z"
                      ></path>
                    </svg>
                  </div>
                )}
                {selectedVendor && paymentMethod[selectedVendor] === "cash" ? (
                  <>
                    <Icon icon="mdi:cart-check" className="w-4 h-4" />
                    <span className="text-xs">Place Order</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:credit-card-outline" className="w-4 h-4" />
                    <span className="text-xs">Proceed to Pay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-indigo-600 flex items-center justify-center">
              <Icon icon="mdi:loading" className="animate-spin mr-2" />
              Don&apos;t close the page now, your order is being placed...
            </h2>
            <p className="text-gray-700 mb-4 flex items-center justify-center">
              <Icon icon="mdi:progress-clock" className="mr-2" />
              {progressMessage}
            </p>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                {/* Spinner SVG paths */}
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingDetailsPage;
