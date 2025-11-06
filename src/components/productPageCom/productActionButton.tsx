"use client";
import { useAuth } from "@/context/authContext";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { MouseEvent, useState } from "react";
import LoginDialog, { useLoginDialog } from "../utils/loginDialog";

interface ProductActionButtonsProps {
  couponCode?: string;
  referalLink?: string;
  productId: string;
  isInStock?: boolean;
}

const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  couponCode,
  referalLink,
  productId,
  isInStock
}) => {
  const [showCoupon, setShowCoupon] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const { open, showDialog, hideDialog } = useLoginDialog();
  const { isLoggedIn } = useAuth();

  const handleCouponClick = (): void => {
    if (!isLoggedIn) {
      showDialog();
      setShowCoupon(false);
    } else {
      setShowCoupon(true);
    }
  };

  const handleLinkClick = (): void => {
    if (!isLoggedIn) {
      showDialog();
    }
  };

  const copyToClipboard = (e: MouseEvent<SVGSVGElement>): void => {
    e.stopPropagation(); // Prevent triggering the parent button's onClick
    if (couponCode) {
      navigator.clipboard.writeText(couponCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
      });
    }
  };

  const handleShare = () => {
    const shareData = {
      title: "Check out this product",
      text: "I found this amazing product, take a look!",
      url: window.location.href,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => {
          console.log("Successful share");
        })
        .catch((error) => {
          console.error("Error sharing:", error);
        });
    } else {
      // Fallback if share API is not supported
      const fallbackUrl = window.location.href;
      navigator.clipboard.writeText(fallbackUrl).then(() => {
        alert("Sharing not supported. URL copied to clipboard!");
      });
    }
  };

  const sendAsGift = () => {
    alert(`Sending Product ID: ${productId} as a gift!`);
  };

  return (
    <>
      <div className="flex flex-col gap-4 items-center w-full">
        {/* Coupon Button */}
        {couponCode && !showCoupon && (
          <button
            onClick={handleCouponClick}
            className={`font-bold w-full flex items-center justify-center py-2 px-6 rounded bg-blue-500 text-white transition ease-in-out duration-300 transform ${isInStock ? "hover:scale-105 hover:bg-blue-600": "filter grayscale"} focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg`}
            disabled={!isInStock}
          >
            <Icon icon="mdi:ticket-percent-outline" className="mr-2 text-lg" />
            Get Coupon Code
          </button>
        )}

        {/* Coupon Code Display with Copy Functionality */}
        {showCoupon && couponCode && (
          <button
            onClick={() => {}}
            className="font-bold w-full flex items-center justify-center py-2 px-6 rounded bg-green-500 hover:bg-green-600 text-white transition ease-in-out duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 shadow-lg"
          >
            <span className="mr-2">{couponCode}</span>
            <Icon
              icon={copied ? "mdi:check-circle" : "mdi:content-copy"}
              className="text-lg cursor-pointer"
              onClick={copyToClipboard}
            />
          </button>
        )}

        {referalLink &&
          (isLoggedIn ? (
            <button
              onClick={() => window.open(referalLink, "_blank")} // Opens referral link in a new tab
              className={`font-bold w-full flex items-center justify-center py-2 px-6 rounded bg-orange-500 text-white transition ease-in-out duration-300 transform ${isInStock ? "hover:scale-105 hover:bg-orange-600": "filter grayscale"} focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-lg`}
              disabled={!isInStock}
            >
              <span className="mr-2">Buy Now</span>
              <Icon
                icon="mdi:shopping-cart"
                className="text-lg cursor-pointer"
              />
            </button>
          ) : (
            <button
              onClick={handleLinkClick}
              className={`font-bold w-full flex items-center justify-center py-2 px-6 rounded bg-orange-500 text-white transition ease-in-out duration-300 transform ${isInStock ? "hover:scale-105 hover:bg-orange-600": "filter grayscale"} focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-lg`}
              disabled={!isInStock}
            >
              <span className="mr-2">Buy Now</span>
              <Icon
                icon="mdi:shopping-cart"
                className="text-lg cursor-pointer"
              />
            </button>
          ))}

        {/* {!couponCode && !referalLink && (
        <button
          onClick={sendAsGift}
          className={`font-bold w-full flex items-center justify-center py-2 px-6 rounded bg-yellow-500 text-white transition ease-in-out duration-300 transform ${isInStock ? "hover:scale-105 hover:bg-yellow-600": "filter grayscale"} focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-lg`}
          disabled={!isInStock}
        >
          <Icon icon="mdi:gift-outline" className="mr-2 text-lg" />
          Send as a Gift
        </button>
      )} */}
      </div>
      <LoginDialog open={open} onClose={hideDialog} />
    </>
  );
};

export default ProductActionButtons;
