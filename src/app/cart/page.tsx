"use client";
import React, { useEffect, useState } from "react";
import { useCart } from "@/context/cartContext";
import { useVendorContext } from "@/context/vendorContext";
import { formatCurrency } from "@/utils";
import { Icon } from "@iconify/react"; // Import Iconify

const VendorName: React.FC<{ vendorId: string }> = ({ vendorId }) => {
  const { getCompanyNameById } = useVendorContext();
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyName = async () => {
      const name = await getCompanyNameById(vendorId);
      setCompanyName(name);
    };

    fetchCompanyName();
  }, [vendorId, getCompanyNameById]);

  return <>{companyName ? companyName : "Loading..."}</>;
};

const CartPage: React.FC = () => {
  const { cart, getTotalPrice, removeFromCart, addToCart } = useCart();

  return (
    <div className="container md:w-9/12 mx-auto py-8 px-4">
      <h1 className="text-lg font-medium mb-4 text-center md:text-left">
        Your Shopping Cart
      </h1>

      {Object.keys(cart).length === 0 ? (
        <div className="text-center text-sm text-gray-600">
          Your cart is empty.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(cart).map((vendorId) => (
            <div
              key={vendorId}
              className="border rounded-lg p-3 shadow-sm bg-white"
            >
              <h2 className="text-sm md:text-base font-medium mb-3 flex items-center">
                <span className="mr-2">Vendor:</span>
                <VendorName vendorId={vendorId} />
              </h2>
              <div className="space-y-3">
                {cart[vendorId].map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col md:flex-row items-center justify-between border-b pb-3"
                  >
                    <div className="flex items-center space-x-3 w-full md:w-2/3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 md:w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="justify-center text-xs font-medium">
                          {item.name}
                          <button
                            onClick={() =>
                              removeFromCart(
                                vendorId,
                                item.productId,
                                item.quantity
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                            aria-label="Remove item"
                          >
                            <Icon
                              icon="mdi:trash-can-outline"
                              width="12"
                              height="12"
                            />
                          </button>
                        </div>

                        <p className="text-gray-500 text-xs">
                          <span className="Price:md:block hidden">
                            {item.quantity} x
                          </span>{" "}
                          {formatCurrency(item.offerPrice)}
                        </p>
                        <div className="flex items-center mt-1">
                          <button
                            onClick={() =>
                              removeFromCart(vendorId, item.productId, 1)
                            }
                            className="p-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                            aria-label="Decrease quantity"
                          >
                            <Icon
                              icon="mdi:minus"
                              className="w-2 h-2 md:w-4 md:h-4"
                            />
                          </button>
                          <span className="mx-2 text-xs">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item, 1)}
                            className="p-1 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                            aria-label="Increase quantity"
                          >
                            <Icon
                              icon="mdi:plus"
                              className="w-2 h-2 md:w-4 md:h-4"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-1/3 mt-3 md:mt-0">
                      <p className="text-sm md:text-base font-medium hidden md:block">
                        {formatCurrency(item.offerPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right">
                <h3 className="text-sm font-medium">
                  Total for <VendorName vendorId={vendorId} />:{" "}
                  {formatCurrency(getTotalPrice(vendorId))}
                </h3>
              </div>
              <a
              href={`/shipping-details?vendorId=${vendorId}`}
              className="block md:inline-block px-5 py-2 bg-blue-500 text-center text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
             >
              Proceed to Checkout
            </a>
            </div>
          ))}

          <div className="text-right mt-6">
            <h2 className="text-base font-medium mb-3">
              Grand Total:{" "}
              {formatCurrency(
                Object.keys(cart).reduce(
                  (total, vendorId) => total + getTotalPrice(vendorId),
                  0
                )
              )}
            </h2>
            <a
              href="/"
              className="flex align-middle gap-2 justify-center md:hidden py-2 bg-gray-50 text-center text-gray-500 rounded-lg transition-colors duration-200"
            >
              <Icon icon="mdi:shop-outline" className="w-5 h-5" />{" "}
              <span>Continue Shopping...</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
