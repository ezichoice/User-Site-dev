"use client";

import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";

export default function AppleLoginButton() {
  const appleLogin = async () => {
    let result = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        // redirectTo: `http://example.com/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={appleLogin}
      className="flex justify-center items-center rounded-md bg-indigo-600 p-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <Icon icon="bi:apple" />
    </button>
  );
}
