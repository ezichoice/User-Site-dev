"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react"; // Assuming you're using the Iconify icon component
import { useCart } from "@/context/cartContext";
import sha256 from "crypto-js/sha256";
import { useAuth } from "@/context/authContext"; // Import the context hook
import { useVendorContext } from "@/context/vendorContext";
import Link from "next/link";
import { formatCurrency } from "@/utils";

const CartIconButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, getTotalItems, getTotalPrice, removeFromCart, addToCart } =
    useCart();
  const { isLoggedIn } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const totalCount = Object.keys(cart).reduce(
    (total, vendorId) => total + getTotalItems(vendorId),
    0
  );

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

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {isLoggedIn && (
        <button
          onClick={toggleCart}
          style={{
            top: "10px",
            right: "10px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Icon icon="mdi-light:cart" width="30" height="30" />
          {/* <Icon icon="mdi:cart-outline"  /> */}

          <span
            style={{
              position: "absolute",
              top: "0",
              right: "-10px",
              backgroundColor: "red",
              borderRadius: "40%",
              color: "#fff",
              padding: "2px 6px",
              fontSize: "8px",
            }}
          >
            {totalCount}
          </span>
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "0",
            width: "300px",
            backgroundColor: "#fff",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <h3 className="text-base font-semibold mb-2">Cart Details</h3>
          {!isLoggedIn ? (
            <div className="text-center text-red-500">
              Please sign in to view and manage your cart.
            </div>
          ) : (
            <>
              {Object.keys(cart).map((vendorId) => (
                <div key={vendorId} className="mb-4">
                  <h4 className="text-sm font-medium">
                    Vendor:
                    <VendorName vendorId={vendorId} />
                  </h4>
                  {cart[vendorId].map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center mb-1 border-b pb-1"
                    >
                      <div className="flex items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded mr-2"
                        />
                        <span className="text-xs">
                          {item.name} x {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => addToCart(item, 1)}
                          className="px-1 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                        >
                          +
                        </button>
                        <button
                          onClick={() =>
                            removeFromCart(vendorId, item.productId, 1)
                          }
                          className="px-1 py-0.5 bg-red-500 text-white rounded hover:bg-red-600 ml-1 text-xs"
                        >
                          -
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs">
                    Total Amount for <VendorName vendorId={vendorId} />:{" "}
                    {formatCurrency(getTotalPrice(vendorId))}
                  </div>
                  <Link
                    href={`/shipping-details?vendorId=${vendorId}`}
                    className="block w-full h-8 py-3 my-2 bg-green-500 text-white text-center rounded-md hover:bg-green-600 flex items-center justify-center"
                  >
                    Checkout
                  </Link>
                </div>
              ))}
              {/* <div className="mt-2 font-bold text-sm">
                Total Amount:{" "}
                {formatCurrency(
                  Object.keys(cart).reduce(
                    (total, vendorId) => total + getTotalPrice(vendorId),
                    0
                  )
                )}
              </div> */}
            </>
          )}

          {isLoggedIn ? (
            <div className="w-full">
              <Link
                href="/cart"
                className="block w-full py-3 my-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600"
              >
                View Cart
              </Link>
            </div>
          ) : (
            <div className="w-full">
              <Link
                href="/auth/login"
                className="block w-full py-3 my-2 bg-green-500 text-white text-center rounded-md hover:bg-green-600"
              >
                Join with us
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartIconButton;
