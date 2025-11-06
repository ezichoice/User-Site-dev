"use client";

import { Product } from "@/app/modals/Product";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ProductCard from "../productCard";
import AddToCartButton from "./addToCartButton";
import ProductActionButton from "./productActionButton";

interface ProductPageClientProps {
  product: any;
}

const ProductPageClient: React.FC<ProductPageClientProps> = ({ product }) => {
  const { userDetails } = useAuth();
  const router = useRouter();
  const offerVariations = product?.offerVariation || [];
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [catProducts, setCatProducts] = useState<Product[]>([]);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [catLoading, setCatLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isPurchased, setIsPurchased] = useState(false);

  // Tabs for product details
  const tabs = [
    { name: "Description", key: "description" },
    { name: "Terms & Conditions", key: "terms" },
    { name: "Return Policy", key: "returnPolicy" },
  ]
    .filter((tab) => product?.terms_conditions || tab.key !== "terms")
    .filter(
      (tab) => product?.vendor_id?.return_policy || tab.key !== "returnPolicy"
    );

  // Check if the product has already been purchased by the current user.
  useEffect(() => {
    async function checkIfPurchased() {
      if (!userDetails?.id || !product?.id) return;

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("orderItems(product_id)")
          .eq("ordered_by", userDetails.id)
          .contains("orderItems", [{ product_id: product.id }]); // Filtering in SQL
        debugger;
        if (error) {
          console.error("Error checking orders:", error);
          return;
        }

        // Check if any order contains the current product
        const purchased = data?.some((order) =>
          order.orderItems?.some((item) => item.product_id === product.id)
        );

        setIsPurchased(purchased || false);
        debugger;
      } catch (err) {
        console.error("Error in checkIfPurchased:", err);
      }
    }

    checkIfPurchased();
  }, [userDetails?.id, product?.id]);

  // Timer for product expiration
  useEffect(() => {
    if (product?.end_date) {
      const endDate = new Date(product.end_date);
      const timer = setInterval(() => {
        const now = new Date();
        const difference = endDate.getTime() - now.getTime();

        if (difference <= 0) {
          setIsExpired(true);
          clearInterval(timer);
        } else {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / (1000 * 60)) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [product?.end_date]);

  // Get current URL for sharing
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const handleNavigation = (route: string) => {
    if (!route) return;
    router.push(route);
  };

  const handleImageClick = (index: number) => {
    setSelectedProduct(index);
  };

  // Fetch related offers from vendor and category.
  // Note: We compute the current timestamp within the effect so that the dependency
  // array only includes 'page' and doesn't cause re-fetching on every render.
  useEffect(() => {
    const fetchOffersWithVariations = async () => {
      setLoading(true);
      const todayString = new Date().toISOString();

      if (!product?.vendor_id?.id) {
        console.error("Vendor ID is missing for the selected product.");
        setLoading(false);
        return;
      }
      let query = supabase
        .from("offers")
        .select(
          `*,offerVariations:offerVariation(*),
           admin(
             name, 
             profile_url,
             company_name,
             is_approved,
             district
           )`
        )
        .eq("is_approved", true)
        .eq("admin.id", product.vendor_id.id)
        .lte("start_date", todayString)
        .gte("end_date", todayString)
        .eq("is_in_stock", true)
        .not("admin", "is", null)
        .range(page * 4, (page + 1) * 4 - 1);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching offers:", error);
        setError(error.message);
      } else {
        const offersWithPrimaryVariation: Product[] = data.map((offer: any) => {
          const firstVariation =
            offer.offerVariations.length > 0 ? offer.offerVariations[0] : {};
          return {
            id: offer.id,
            name: firstVariation.name || offer.name,
            vendor_name: offer.admin?.company_name || "Unknown Vendor",
            vendor_img: offer.admin?.profile_url || "",
            rating: offer.rating,
            offer_price: firstVariation.offer_price || offer.offer_price,
            actual_price: firstVariation.actual_price || offer.actual_price,
            img_url: firstVariation.img_url || offer.img_url,
            offer_variation_id: firstVariation.id,
            is_in_stock: offer.is_in_stock,
          } as Product;
        });

        setProducts((prevOffers) =>
          page === 0
            ? offersWithPrimaryVariation
            : [...prevOffers, ...offersWithPrimaryVariation]
        );
        setHasMore(data.length === 4);
      }
      setLoading(false);
    };

    const fetchOffersWithCategories = async () => {
      setCatLoading(true);
      const todayString = new Date().toISOString();

      if (!product?.category) {
        console.error("Category is missing for the selected product.");
        setCatLoading(false);
        return;
      }
      let query = supabase
        .from("offers")
        .select(
          `*,offerVariations:offerVariation(*),
           admin(
             name, 
             profile_url,
             company_name,
             is_approved,
             district
           )`
        )
        .eq("is_approved", true)
        .eq("category", product.category)
        .not("admin", "is", null)
        .lte("start_date", todayString)
        .eq("is_in_stock", true)
        .gte("end_date", todayString)
        .range(page * 4, (page + 1) * 4 - 1);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching offers:", error);
        setError(error.message);
      } else {
        const offersWithPrimaryVariation: Product[] = data.map((offer: any) => {
          const firstVariation =
            offer.offerVariations.length > 0 ? offer.offerVariations[0] : {};
          return {
            id: offer.id,
            name: firstVariation.name || offer.name,
            vendor_name: offer.admin?.company_name || "Unknown Vendor",
            vendor_img: offer.admin?.profile_url || "",
            rating: offer.rating,
            offer_price: firstVariation.offer_price || offer.offer_price,
            actual_price: firstVariation.actual_price || offer.actual_price,
            img_url: firstVariation.img_url || offer.img_url,
            offer_variation_id: firstVariation.id,
            categories: offer.category,
            is_in_stock: offer.is_in_stock,
          } as Product;
        });

        setCatProducts((prevOffers) =>
          page === 0
            ? offersWithPrimaryVariation
            : [...prevOffers, ...offersWithPrimaryVariation]
        );
        setHasMore(data.length === 4);
      }
      setCatLoading(false);
    };

    fetchOffersWithVariations();
    fetchOffersWithCategories();
  }, [page]); // 'today' is now computed within the effect

  return (
    <div className="container lg:w-10/12">
      <div className="flex flex-col justify-center md:flex-row sm:w-10/12 md:mx-auto">
        <div className="md:w-1/2 relative">
          {isExpired && (
            <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded-lg text-sm z-10">
              Expired
            </div>
          )}
          <Image
            src={
              selectedProduct !== null &&
              offerVariations[selectedProduct]?.img_url
                ? offerVariations[selectedProduct].img_url
                : "/sample.jpg"
            }
            alt={product?.name || "Product Image"}
            width={500}
            height={600}
            objectFit="cover"
            objectPosition="center"
            className={`rounded-lg shadow-lg mt-4 ${
              isExpired ? "grayscale" : ""
            }`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {offerVariations.length > 1 &&
              offerVariations.map((offer: any, index: number) => (
                <div
                  key={offer.id}
                  onClick={() => handleImageClick(index)}
                  className={`relative cursor-pointer transition-transform transform hover:scale-105 ${
                    selectedProduct === index ? "border-2 border-blue-500" : ""
                  }`}
                >
                  <Image
                    src={offer.img_url || "/sample.jpg"}
                    alt={product?.name || "Product Image"}
                    width={300}
                    height={300}
                    className={`rounded-lg shadow-lg ${
                      isExpired ? "grayscale" : ""
                    }`}
                  />
                </div>
              ))}
          </div>
        </div>
        <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-xl md:text-4xl font-bold mb-4">
            {product?.name} -{" "}
            <span>
              {selectedProduct !== null &&
                offerVariations[selectedProduct]?.actual_price &&
                offerVariations[selectedProduct]?.offer_price &&
                Math.round(
                  ((offerVariations[selectedProduct].actual_price -
                    offerVariations[selectedProduct].offer_price) /
                    offerVariations[selectedProduct].actual_price) *
                    100
                )}
              % off
            </span>
          </h1>
          {selectedProduct !== null &&
            offerVariations[selectedProduct]?.actual_price && (
              <p className="text-lg md:text-3xl font-semibold text-gray-700 mb-4">
                <small className="line-through mr-3">
                  {formatCurrency(
                    offerVariations[selectedProduct].actual_price
                  )}
                </small>
                {offerVariations[selectedProduct]?.offer_price &&
                  formatCurrency(offerVariations[selectedProduct].offer_price)}
              </p>
            )}

          {selectedProduct !== null &&
            offerVariations[selectedProduct]?.sku && (
              <p className="text-xs md:text-sm text-gray-400">
                SKU - {offerVariations[selectedProduct].sku}
              </p>
            )}

          {!isExpired && timeLeft && (
            <>
              <p className="text-xl text-gray-400 my-4 md:text-left text-center">
                Time Left: {timeLeft}
              </p>
              
              <ProductActionButton
                couponCode={product?.coupon}
                referalLink={product?.referal_link}
                productId={product?.id}
                isInStock={product?.is_in_stock}
              />
              {!product?.referal_link && (
                <>
                  {isPurchased && product.claims_limit ? (
                    <p className="text-sm text-green-600 mt-2">
                      You have purchased this product already
                    </p>
                  ) : (
                    <>
                      <AddToCartButton
                        productId={product.id}
                        name={product.name}
                        price={parseInt(
                          offerVariations[selectedProduct]?.actual_price ||
                            "0"
                        )}
                        offerPrice={
                          offerVariations[selectedProduct]?.offer_price || 0
                        }
                        image={
                          offerVariations[selectedProduct]?.img_url ||
                          "/sample.jpg"
                        }
                        vendorId={product.vendor_id?.id}
                      />
                    </>
                  )}
                </>
              )}
              
            </>
          )}

          {isExpired && (
            <p className="text-red-600 font-semibold">
              This product has expired.
            </p>
          )}

          {product.vendor_id && (product?.coupon || product?.referal_link) && (
            <>
              <small className="text-gray-500 mb-0 mt-4">Sold By</small>
              <div
                className="flex items-center mb-4 border border-gray-50 bg-gray-50 rounded-md p-2 hover:cursor-pointer"
                onClick={() =>
                  handleNavigation(`/vendors/${product.vendor_id.company_name}`)
                }
              >
                <img
                  src={product.vendor_id.profile_url || "/VendorImg.png"}
                  alt={product.vendor_id.company_name || "Vendor"}
                  className="w-10 h-10 sm:w-20 sm:h-20 rounded-full"
                />
                <span className="ml-4 text-gray-700">
                  <b>{product.vendor_id.company_name}</b>
                  <br />
                  {product.vendor_id.company_phone && (
                    <small className="mb-0">
                      <a
                        href={`tel:${product.vendor_id.company_phone}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-gray hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-300 font-small rounded-full text-sm text-center inline-flex items-center"
                      >
                        <Icon icon="ic:round-phone" />
                        {product.vendor_id.company_phone}
                      </a>
                    </small>
                  )}
                  <br />
                  {product.vendor_id.email && (
                    <small>
                      <a
                        href={`mailto:${product.vendor_id.email}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-gray hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-300 font-small rounded-full text-sm text-center inline-flex items-center"
                      >
                        <Icon icon="ic:outline-mail" />
                        {product.vendor_id.email}
                      </a>
                    </small>
                  )}
                </span>
              </div>
            </>
          )}

          <small className="text-gray-500 mb-0">Share Via</small>
          <div className="flex space-x-4 my-4">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                currentUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <Icon icon="ic:baseline-facebook" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                currentUrl
              )}&text=${encodeURIComponent(product?.name || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600"
            >
              <Icon icon="prime:twitter" />
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(
                "Check out this product!"
              )}&body=${encodeURIComponent(
                `I found this product and thought you might like it: ${currentUrl}`
              )}`}
              className="text-gray-600 hover:text-gray-800"
            >
              <Icon icon="ic:outline-email" />
            </a>
          </div>
        </div>
      </div>

      <div className="container mt-8">
        <div className="relative w-full">
          <div
            className="absolute top-0 bottom-0 left-0 bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: `${100 / tabs.length}%`,
              transform: `translateX(${
                tabs.findIndex((tab) => tab.key === activeTab) * 100
              }%)`,
            }}
          ></div>
          <div className="flex justify-between text-center relative z-10">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`relative w-full py-2 text-sm md:text-lg font-semibold transition-colors duration-300 ${
                  activeTab === tab.key ? "text-white" : "text-gray-500"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
        <div className="tab-content mt-4">
          {activeTab === "description" && (
            <div className="transition-opacity duration-500 ease-in-out opacity-100">
              <p className="text-lg text-gray-400 mb-2">Product Description</p>
              <p className="text-gray-600 text-sm md:text-base mb-6 whitespace-pre-wrap">
                {product?.description}
              </p>
            </div>
          )}
          {activeTab === "terms" && (
            <div className="transition-opacity duration-500 ease-in-out opacity-100">
              <p className="text-lg text-gray-400 mb-2">Terms & Conditions</p>
              <p className="text-gray-600 text-sm md:text-base mb-6 whitespace-pre-wrap">
                {product?.terms_conditions}
              </p>
            </div>
          )}
          {activeTab === "returnPolicy" && (
            <div className="transition-opacity duration-500 ease-in-out opacity-100">
              <p className="text-lg text-gray-400 mb-2">Return Policy</p>
              <p className="text-gray-600 text-sm md:text-base mb-6 whitespace-pre-wrap">
                {product.vendor_id?.return_policy}
              </p>
            </div>
          )}
        </div>

        <div className="col-span-12 md:col-span-10">
          <h1 className="p-4 text-lg">Popular Picks</h1>
          <div className="container mx-auto px-4 my-3 md:w-11/12">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.length > 0
                ? products.map((offer: Product) => (
                    <ProductCard key={offer.id} product={offer} />
                  ))
                : !loading && (
                    <div className="text-center col-span-12 flex flex-col items-center justify-center py-10">
                      <Icon
                        icon="fa-solid:box-open"
                        className="text-5xl text-gray-400 mb-4"
                      />
                      <p className="text-xl font-semibold text-gray-600">
                        No related products found
                      </p>
                    </div>
                  )}
            </div>
            {loading && <p>Loading...</p>}
            {!hasMore && (
              <p className="text-center text-gray-500 mt-4">
                No more related products to load.
              </p>
            )}
          </div>
        </div>
        <div className="col-span-12 md:col-span-10">
          <h1 className="p-4 text-lg">Related products</h1>
          <div className="container mx-auto px-4 my-3 md:w-11/12">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {catProducts.length > 0
                ? catProducts.map((offer: Product) => (
                    <ProductCard key={offer.id} product={offer} />
                  ))
                : !catLoading && (
                    <div className="text-center col-span-12 flex flex-col items-center justify-center py-10">
                      <Icon
                        icon="fa-solid:box-open"
                        className="text-5xl text-gray-400 mb-4"
                      />
                      <p className="text-xl font-semibold text-gray-600">
                        No related products found
                      </p>
                    </div>
                  )}
            </div>
            {catLoading && <p>Loading...</p>}
            {!hasMore && (
              <p className="text-center text-gray-500 mt-4">
                No more related products to load.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPageClient;
