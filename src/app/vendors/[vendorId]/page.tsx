"use client";
import { Product } from "@/app/modals/Product";
import LoadingSpinner from "@/components/loadingCom/LoadingSpinner";
import ProductFullList from "@/components/utils/productFullList";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

interface Vendor {
  id: string;
  name: string;
  company_phone: string;
  company_name: string;
  profile_url: string;
  email: string;
  description: string;
  offers: Array<Product>;
}
interface Banner {
  banner_url: string;
  redirect_to?: string;
}

const VendorPage: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const params = useParams();

  const companyName = decodeURIComponent(params.vendorId as string);

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      if (companyName) {
        try {
          // Fetch vendor data
          const { data, error } = await supabase
            .from("admin")
            .select(
              `id, name, company_phone, company_name, profile_url, email, description, 
              offers(*, category(name), offerVariation(*))`
            )
            .eq("company_name", companyName)
            .eq("role", "vendor")
            .filter("offers.is_approved", "eq", true)
            .single();

          if (error) throw error;

          // Update products with additional data
          let vendorData = {
            ...data,
            offers: updatedProducts(
              data.offers,
              data.company_name,
              data.profile_url
            ),
          };

          setVendor(vendorData);
          // Fetch banners for the vendor
          const { data: bannerData, error: bannerError } = await supabase
            .from("vendorBanner")
            .select("banner_url,redirect_to")
            .eq("vendor_id", data.id)
            .eq("is_active", true);

          if (bannerError) throw bannerError;

          if (bannerData.length > 0) {
            setBanners(bannerData);
          }
        } catch (error: any) {
          setError(error.message);
        }
      }
      setLoading(false);
    };

    if (companyName) {
      fetchVendor();
    }
  }, [companyName]);
  const shuffleArray = (array: Banner[]) => {
    let shuffled = [...array];
    let isValidShuffle = false;

    while (!isValidShuffle) {
      // Shuffle the array
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Check if the first and last items are in different positions
      isValidShuffle =
        shuffled[0] !== array[0] &&
        shuffled[shuffled.length - 1] !== array[array.length - 1];
    }

    return shuffled;
  };

  const updatedProducts = (
    data: Product[],
    vendor_name: string,
    vendor_img: string
  ) => {
    return data.map((product) => {
      const today = new Date();
      const startDate = new Date(product.start_date ?? "");
      const endDate = new Date(product.end_date ?? "");

      let status;
      if (today < startDate) {
        status = "Coming Soon";
      } else if (
        today >= startDate &&
        today < new Date(endDate.setDate(endDate.getDate() + 1))
      ) {
        status = "Active";
      } else {
        status = "Expired";
      }
      return {
        ...product,
        img_url: product.offerVariation?.[0]?.img_url
          ? product.offerVariation?.[0].img_url
          : "/sample.jpg",
        offer_price: product.offerVariation?.[0]?.offer_price || 0,
        actual_price:
          typeof product.offerVariation?.[0]?.actual_price === "string"
            ? Number(product.offerVariation?.[0]?.actual_price)
            : product.offerVariation?.[0]?.actual_price || 0,

        vendor_name,
        vendor_img,
        status,
      };
    });
  };

  // Group offers by category with counts
  const groupOffersByCategory = (offers: Product[]) => {
    const groupedOffers: {
      [categoryName: string]: { count: number; offers: Product[] };
    } = {};

    offers.forEach((offer) => {
      const categoryName = offer.category?.name || "Uncategorized";
      if (!groupedOffers[categoryName]) {
        groupedOffers[categoryName] = { count: 0, offers: [] };
      }
      groupedOffers[categoryName].count += 1;
      groupedOffers[categoryName].offers.push(offer);
    });

    return groupedOffers;
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Filter offers based on selected category
  const filteredOffers = () => {
    if (!vendor?.offers) return [];
    if (selectedCategory === "All") return vendor.offers;
    return vendor.offers.filter(
      (offer) => offer.category?.name === selectedCategory
    );
  };

  const truncateDescription = (description: string, wordLimit: number) => {
    const words = description.split(" ");
    if (words.length <= wordLimit) {
      return description;
    }
    return words.slice(0, wordLimit).join(" ");
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (!vendor) return <div>Vendor not found</div>;

  const categorizedOffers = groupOffersByCategory(vendor.offers);

  const availableCategories = [
    { name: "All", count: vendor.offers.length },
    ...Object.keys(categorizedOffers).map((categoryName) => ({
      name: categoryName,
      count: categorizedOffers[categoryName].count,
    })),
  ];

  // Slider settings for react-slick
  const sliderSettings = {
    dots: banners.length > 1,
    infinite: banners.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: banners.length > 1,
    autoplay: banners.length > 1,
    autoplaySpeed: 3000,
  };

  return (
    <>
      <div className="container mx-auto px-4 pt-12">
        <div className="w-10/12 mx-auto">
          <div className="relative bg-white shadow-sm rounded-lg py-6 ">
            {/* Floating Profile Image */}
            <div className="absolute inset-x-0 top-[-40px] mx-auto w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
              <Image
                src={vendor.profile_url || "/VendorImg.png"} // Use a default image if profile_url is null
                alt={vendor.company_name || "Vendor Profile"}
                layout="fill"
                objectFit="cover"
              />
            </div>

            {/* Vendor Info */}
            <div className="text-center mt-16">
              <h1 className="text-3xl font-bold text-gray-900">
                {vendor.company_name}
              </h1>
            </div>
          </div>
          {/* banner  */}
          <div className="container mx-auto px-4 py-5">
            {banners.length > 1 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Slider {...sliderSettings}>
                  {shuffleArray(banners).map((banner, index) => (
                    <a
                      key={index}
                      href={banner.redirect_to || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={banner.banner_url}
                        alt={`Banner ${index + 1}`}
                      />
                    </a>
                  ))}
                </Slider>
                <Slider {...sliderSettings}>
                  {banners.map((banner, index) => (
                    <a
                      key={index}
                      href={banner.redirect_to || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={banner.banner_url}
                        alt={`Banner ${index + 1}`}
                      />
                    </a>
                  ))}
                </Slider>
              </div>
            ) : banners.length === 1 ? (
              <a
                href={banners[0].redirect_to || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={banners[0].banner_url}
                  alt="Single Banner"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </a>
            ) : (
              <></>
            )}
          </div>
          {/* about us  */}
          <div className="shadow-sm rounded-lg">
            <div className="bg-white shadow-sm rounded-lg p-6 ">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About Us
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {showFullDescription
                  ? vendor.description
                  : truncateDescription(vendor.description, 100)}
                {vendor.description.split(" ").length > 100 && (
                  <span
                    className="text-blue-500 cursor-pointer font-semibold"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? " See Less" : "... See More"}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* <div>
              {banners.length > 0 ? (
                banners.map((item, index) => (
                  <img
                    key={index}
                    src={
                      "https://aokwfioxeqahjifyoeau.supabase.co/storage/v1/object/public/ezichoice/Profile/1734509575556"
                    }
                    alt={`Banner ${index + 1}`}
                  />
                ))
              ) : (
                <div>No banners available</div>
              )}
            </div> */}
            {/* <div>
              {banners.length > 0 ? (
                banners.map((item, index) => (
                  <img
                    key={index}
                    src={
                      "https://aokwfioxeqahjifyoeau.supabase.co/storage/v1/object/public/ezichoice/Profile/1734509575556"
                    }
                    alt={`Banner ${index + 1}`}
                  />
                ))
              ) : (
                <div>No banners available</div>
              )}
            </div> */}
          </div>

          {/* Category Chips with Counts */}
          <div className="flex flex-wrap gap-2 my-4">
            {availableCategories.map((categoryObj, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === categoryObj.name
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => handleCategorySelect(categoryObj.name)}
              >
                {categoryObj.name} ({categoryObj.count})
              </button>
            ))}
          </div>
        </div>
        {/* Render a ProductList for filtered offers */}
        {filteredOffers().length > 0 ? (
          <ProductFullList
            name={`Offers in ${selectedCategory}`}
            products={filteredOffers()}
            noProductMessage={`No products in ${selectedCategory}`}
          />
        ) : (
          // Show "No products available" message with a centered image
          <div className="text-center col-span-12 flex flex-col items-center justify-center py-10">
            <Icon
              icon="fa-solid:box-open"
              className="text-5xl text-gray-400 mb-4"
            />
            <p className="text-xl font-semibold text-gray-600">
              No products found
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default VendorPage;
