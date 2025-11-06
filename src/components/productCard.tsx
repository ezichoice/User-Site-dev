import { Product } from "@/app/modals/Product";
import { formatCurrency } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link
      href={`/products/${encodeURIComponent(product.id)}`}
      passHref
      className={`relative `}
    >
      <div className="w-full rounded-lg shadow-lg bg-white group relative flex flex-col transition-transform transform hover:scale-105">
        {/* Image Container */}
        <div className="relative  rounded-t-lg">
          <div className="relative w-full " style={{ paddingBottom: "100%" }}>
            <Image
              src={product.img_url || "/sample.jpg"}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className={`rounded-t-lg ${
                (product.status === "Expired" || !product.is_in_stock) ? "filter grayscale" : ""
              }`}
            />
            {
              !product.is_in_stock && (
                <div className="absolute right-1 top-1 py-1 px-2 rounded-lg bg-gray-50 border-2 border-black">
                  <span className="text-[0.75rem] uppercase font-medium">Sold Out Now</span>
                </div>
              )
            }
          </div>

          {product.status === "Expired" && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-3 py-1 rounded">
              Expired
            </div>
          )}
          {product.status === "Coming Soon" && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded">
              Coming Soon
            </div>
          )}
        </div>

        {/* Vendor Image */}
        <div className="flex items-center justify-center -mt-6 relative z-10">
          <div className="border-4 border-white rounded-full shadow-md ">
            <img
              src={product.vendor_img || "/VendorImg.png"}
              className="h-12 w-12 rounded-full object-cover"
              alt={product.vendor_name}
            />
          </div>
        </div>

        {/* Product Information */}
        <div className="p-4 flex-grow">
          <p className="text-center text-gray-800 font-semibold text-lg truncate">
            {product.name}
          </p>

          <p className="text-center text-gray-600 text-md font-bold mt-2">
            <s className="text-sm"> {formatCurrency(product.actual_price)}</s>{" "}
            <br />
            <span className="text-red-500">
              {formatCurrency(product.offer_price)}
            </span>
            <br />
            <span className="text-sm text-green-500">
              {" "}
              -{" "}
              {Math.round(
                ((product.actual_price - product.offer_price) /
                  product.actual_price) *
                  100
              )}
              %
            </span>
          </p>
        </div>

        {/* Vendor Name */}
        <div className="w-full bg-green-600 text-white py-3 rounded-b-lg text-center text-sm font-medium">
          {product.vendor_name}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
