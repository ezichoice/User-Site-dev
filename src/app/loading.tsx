import React from "react";
import { Icon } from "@iconify/react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center w-full h-screen bg-gray-50">
      <div className="flex flex-col items-center">
        <Icon icon="eos-icons:bubble-loading" width="24" height="24" />
        <p className="text-gray-600 mt-4 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}
