"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { supabase } from "@/lib/supabase";

export default function FacebookLoginButton() {
  const facebookLogin = async() => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
    })
  };

  return (
    <button
      onClick={facebookLogin}
      className="flex justify-center items-center rounded-md bg-indigo-600 p-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      <Icon icon="bi:facebook" />
    </button>
  );
}
