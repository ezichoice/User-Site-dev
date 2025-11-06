"use client";

import { gSignInWithOAuth } from "@/utils/actions/storage";
import { Icon } from "@iconify/react";

export default function GoogleLoginButton() {
  const googleLogin = async () => {
    const url = await gSignInWithOAuth();
    window.location.href = url || "/auth/login";
  };

  return (
    <button
      onClick={googleLogin}
      className="flex justify-center items-center rounded-md bg-indigo-600 p-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <Icon icon="bi:google" />
    </button>
  );
}
