"use client";
import React, { useState, MouseEvent } from "react";
import LoginDialog, { useLoginDialog } from "../utils/loginDialog";
import { useAuth } from "@/context/authContext";

interface CouponButtonProps {
  couponCode: string;
}

const CouponButton: React.FC<CouponButtonProps> = ({ couponCode }) => {
  const [showCoupon, setShowCoupon] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const { open, showDialog, hideDialog } = useLoginDialog();
  const { isLoggedIn } = useAuth();

  const handleClick = (): void => {
     console.log("isLoggedIn:", isLoggedIn);
    if(!isLoggedIn){
      showDialog();
      setShowCoupon(false);
    }
    else{
      setShowCoupon(true);
    }
  };

  const copyToClipboard = (e: MouseEvent<SVGSVGElement>): void => {
    e.stopPropagation(); // Prevent triggering the parent button's onClick
    navigator.clipboard.writeText(couponCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    });
  };

  return (
    <>
    <button
      onClick={handleClick}
      className={`font-bold py-2 px-4 mt-2 rounded inline-flex items-center w-full justify-center ${
        showCoupon && isLoggedIn
          ? "bg-green-500 hover:bg-green-700"
          : "bg-blue-500 hover:bg-blue-700"
      } text-white`}
    >
      {!showCoupon || !isLoggedIn  ? (
        "Get Coupon Code"
      ) : (
        <>
          <span className="mr-2">{couponCode}</span>
          <svg
            onClick={copyToClipboard}
            className={`h-5 w-5 cursor-pointer ${
              copied ? "text-green-500" : "text-white"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </>
      )}
    </button>
   <LoginDialog open={open} onClose={hideDialog} />
  </>
  );
};

export default CouponButton;
