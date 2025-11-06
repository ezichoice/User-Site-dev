"use client"; // Ensure this component runs on the client side

import { useAuth } from "@/context/authContext";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";

import { Tooltip } from 'react-tooltip';

const AvatarMenu: React.FC = () => {
  const { isLoggedIn, userDetails, userImg, loading, handleSignOut, isProfileCompleted } =
    useAuth(); // Use context values
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex-row md:flex items-center ">
      {loading ? (
        <div role="status" className="animate-pulse flex items-center">
          <div className="w-8 h-8 bg-gray-300 rounded-full dark:bg-gray-700"></div>
          <span className="sr-only">Loading...</span>
        </div>
      ) : isLoggedIn ? userImg && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="focus:outline-none flex items-center justify-center relative"
            aria-label="User menu"
          >
            <Image
              src={userImg}
              width={32}
              height={32}
              className="rounded-full cursor-pointer"
              alt={userDetails ? userDetails.name : "Profile Picture"}
            />
            
            {!isProfileCompleted && <div className="absolute -top-2 -right-2 text-[0.75rem] rounded-full w-4 h-4 text-red-600 font-bold" data-tooltip-id="my-tooltip" data-tooltip-content="Profile incomplete!">
              <span className="font-bold">
                !
              </span>
            </div>}
            <Tooltip id="my-tooltip" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="block md:flex items-center justify-center">
          <Link
            href={"/auth/login"}
            className="w-full md:w-32 hidden md:block px-6 py-2 text-center  bg-gradient-to-r from-red-400 to-red-700 text-white font-semibold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition duration-300 text-xs mt-2 md:mt:0"
          >
            Join with us
          </Link>
        </div>
      )}
    </div>
  );
};

export default React.memo(AvatarMenu); // Memoize the component to prevent unnecessary re-renders
