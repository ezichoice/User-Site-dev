"use client";
import React, { useState } from "react";
import CategoriesDropdown from "./navBarCom/categoriesDropdown";
import AvatarMenu from "./navBarCom/avatarDropdown";
import Drawer from "@/components/utils/drawer";
import { Icon } from "@iconify/react/dist/iconify.js";
import CartIconButton from "./navBarCom/cartIconButton";
import { useRouter, usePathname } from "next/navigation";

const NavBar = () => {
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false); // Hide mobile search after searching
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="container md:w-10/12 mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Left section: Drawer toggle & Logo */}
          <div className="flex items-center">
            <div>
              <button className="p-4" onClick={toggleDrawer}>
                <Icon icon="octicon:three-bars-16" />
              </button>
            </div>
            <a href="/" className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8 md:h-12" />
            </a>
          </div>

          {/* Right section: Search, Cart, Avatar */}
          <div className="flex items-center gap-4">
            {/* ------------------ DESKTOP SEARCH ------------------ */}
            {/* Only show the search box if we are not on the products page */}
            {pathname !== "/products" && (
              <div className="hidden md:flex items-center border rounded-full px-2 py-1 bg-gray-100 w-full max-w-xs">
                <input
                  type="text"
                  className="flex-grow bg-transparent outline-none text-sm px-2"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <button onClick={handleSearch} className="p-2">
                  <Icon icon="mdi:magnify" className="text-gray-600" />
                </button>
              </div>
            )}

            {/* ------------------ MOBILE SEARCH ICON ------------------ */}
            {pathname !== "/products" && !showMobileSearch && (
              <button
                className="flex md:hidden p-2"
                onClick={() => setShowMobileSearch(true)}
              >
                <Icon icon="mdi:magnify" className="text-gray-600" />
              </button>
            )}

            {/* ------------------ MOBILE SEARCH BOX ------------------ */}
            {pathname !== "/products" && showMobileSearch && (
              <div className=" md:hidden flex items-center border rounded-full bg-gray-100 w-48 max-w-xs z-30">
                <input
                  type="text"
                  className="flex-grow bg-transparent outline-none text-xs w-20 "
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <button onClick={handleSearch} className="">
                  <Icon icon="mdi:magnify" className="text-gray-600" />
                </button>
                {/* Optional close icon to hide the mobile search */}
                <button
                  className="p-2"
                  onClick={() => setShowMobileSearch(false)}
                >
                  <Icon icon="mdi:close" className="text-gray-600" />
                </button>
              </div>
            )}

            <CartIconButton />
            <div>
              <AvatarMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-500 ease-in-out ${
          isDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleDrawer}
      ></div>

      {/* Drawer */}
      <div
        id="drawer"
        className={`fixed top-0 left-0 h-full w-64 bg-white overflow-y-scroll text-black z-40 shadow-lg transition-transform duration-500 ease-in-out transform ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={toggleDrawer}
          className="absolute top-4 right-4 p-2 rounded-full"
        >
          X
        </button>
        <Drawer />
      </div>
    </nav>
  );
};

export default NavBar;
