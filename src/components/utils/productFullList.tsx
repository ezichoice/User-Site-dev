import React from "react";
import ProductCard from "../productCard";
import Slider from "react-slick";
import { Icon } from "@iconify/react/dist/iconify.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Product } from "@/app/modals/Product";

interface productFullListProps {
  products: Product[];
  name: string;
  noProductMessage?: string;
}

const NextArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow next-arrow`}
      style={{
        ...style,
        display: "block",
        position: "absolute",
        right: "-25px", // Adjust this value to control distance from the container
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 1,
      }}
      onClick={onClick}
    >
      <Icon icon="fa-solid:chevron-right" className="text-xs text-gray-600" />
    </div>
  );
};

const PrevArrow = (props: any) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} custom-arrow prev-arrow`}
      style={{
        ...style,
        display: "block",
        position: "absolute",
        left: "-25px", // Adjust this value to control distance from the container
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 1,
      }}
      onClick={onClick}
    >
      <Icon icon="fa-solid:chevron-left" className="text-xs text-gray-600" />
    </div>
  );
};

const productFullList: React.FC<productFullListProps> = ({
  products,
  name,
  noProductMessage = "No Products Found",
}) => {
  return (
    <div className="container md:mt-5">
      <div className="relative container mx-auto md:w-11/12">
        <h2 className=" font-bold py-3 md:mb-5 sm:text-lg md:text-xl">
          {name}
        </h2>

        {products.length < 1 ? (
          <div className="grid text-center">
            <div className="text-center col-span-12 flex flex-col items-center justify-center py-10">
              <Icon
                icon="fa-solid:box-open"
                className="text-5xl text-gray-400 mb-4"
              />
              <p className="text-xl font-semibold text-gray-600">
                {noProductMessage}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-4 ">
              {products.map((product, i) => (
                <div key={i} className="p-2 justify-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default productFullList;
