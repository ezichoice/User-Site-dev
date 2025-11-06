import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Vendor } from "@/types/vendor";

interface VendorListProps {
  vendors: Vendor[];
  category: string[];
  name?: string; // `name` is now optional, default handled in function
}

const VendorList: React.FC<VendorListProps> = ({ vendors, name, category }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | "All">(
    "All"
  );

  // Filter vendors based on the selected category
  const filteredVendors =
    selectedCategory === "All"
      ? vendors
      : vendors.filter((vendor) => vendor.category.name === selectedCategory);
  return (
    <div className="container mx-auto py-8">
      {name && (
        <h2 className="text-3xl font-extrabold text-center text-gray-800 py-6">
          {name}
        </h2>
      )}

      {/* Category Filter UI */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
            selectedCategory === "All"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {category.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6">
        {filteredVendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/vendors/${encodeURIComponent(vendor.company_name)}`}
            passHref
          >
            <div className="group bg-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200 rounded-lg overflow-hidden cursor-pointer">
              <div className="p-6 flex flex-col items-center">
                <VendorImage vendor={vendor} />
                <h2 className="text-xl font-semibold text-gray-800 mt-4 text-center">
                  {vendor.company_name}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VendorList;

interface VendorImageProps {
  vendor: Vendor;
}

const VendorImage: React.FC<VendorImageProps> = ({ vendor }) => {
  return vendor.profile_url?.endsWith(".svg") ? (
    <img
      src={vendor.profile_url}
      alt={vendor.company_name}
      width={120}
      height={120}
      className="rounded-full h-28 w-28 object-cover border-4 border-gray-200"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/VendorImg.png"; // Ensure `/public/VendorImg.png` exists
      }}
    />
  ) : (
    <Image
      src={vendor.profile_url || "/VendorImg.png"}
      alt={vendor.company_name}
      width={120}
      height={120}
      className="rounded-full h-28 w-28 object-cover border-4 border-gray-200"
    />
  );
};
