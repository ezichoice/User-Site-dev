"use client";

import React, { useState, Fragment } from "react";
import { useRouter } from "next/navigation";

export const useLoginDialog = () => {
  const [open, setOpen] = useState(false);

  const showDialog = () => setOpen(true);
  const hideDialog = () => setOpen(false);

  return { open, showDialog, hideDialog };
};

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog position wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dialog panel */}
        <div
          className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog title */}
          <div className="mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Login Required
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Please log in to add items to your cart.
            </p>
          </div>

          {/* Dialog buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => {
                router.push("/auth/login");
                onClose();
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;
