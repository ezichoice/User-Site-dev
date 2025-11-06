"use client";

import Carousel from "@/components/carousel";
import HalfBanners from "@/components/halfBanners";
import CourseList from "@/components/homePageCom/courseList";
import ProductList from "@/components/homePageCom/productList";
import LoadingSpinner from "@/components/loadingCom/LoadingSpinner";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { Product } from "./modals/Product";

// environment variable is used to determine if the app is in development mode
const environment = process.env.NODE_ENV;

interface HomeSection {
  id: number;
  title: string;
  no_product_message: string;
  offer_ids: string[] | null;
  type: string; // "carousel" or "product_list"
  offers?: Product[]; // For product_list sections
  banners?: { id: number; img: string; url: string | null }[]; // For carousel sections
}

const HomePage: React.FC = () => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from("homeSections")
          .select("*")
          .order("value", { ascending: false });

        if (sectionsError) {
          throw sectionsError;
        }

        if (!sectionsData || sectionsData.length === 0) {
          setSections([]);
          setLoading(false);
          return;
        }
        console.log(sectionsData);

        // Separate product_list sections from carousel sections
        const productListSections = sectionsData.filter(
          (section) => section.type === "product_list"
        );

        const carouselSections = sectionsData.filter(
          (section) => section.type === "carousel"
        );

        // For product list sections, fetch offers
        let offersWithPrimaryVariation: Product[] = [];
        if (productListSections.length > 0) {
          const allOfferIds = productListSections.flatMap(
            (section) => section.offer_ids || []
          );
          const uniqueOfferIds = Array.from(new Set(allOfferIds));

          if (uniqueOfferIds.length > 0) {
            const todayString = new Date().toISOString();
            const { data: offersData, error: offersError } = await supabase
              .from("offers")
              .select(
                `
                id,
                name,
                is_approved,
                referal_link,
                coupon,
                category,
                start_date,
                end_date,
                is_in_stock,
                offerVariations:offerVariation(
                  id, 
                  name, 
                  sku, 
                  actual_price, 
                  offer_price, 
                  img_url, 
                  quantity
                ),
                admin(
                  name, 
                  profile_url,
                  company_name,
                  is_approved,
                  district
                )
              `
              )
              .in("id", uniqueOfferIds)
              .eq("is_approved", true)
              .eq("is_in_stock", true)
              .lte("start_date", todayString)
              .gte("end_date", todayString)
              .not("admin", "is", null);

            if (offersError) {
              throw offersError;
            }

            offersWithPrimaryVariation = (offersData || []).map(
              (offer: any) => {
                const firstVariation =
                  offer.offerVariations && offer.offerVariations.length > 0
                    ? offer.offerVariations[0]
                    : {};

                return {
                  id: offer.id,
                  name: firstVariation.name || offer.name,
                  vendor_name: offer.admin?.company_name || "Unknown Vendor",
                  vendor_img: offer.admin?.profile_url || "",
                  rating: offer.rating || 0,
                  offer_price: firstVariation.offer_price || 0,
                  actual_price: firstVariation.actual_price || 0,
                  img_url: firstVariation.img_url || "",
                  offer_variation_id: firstVariation.id,
                  is_in_stock: offer.is_in_stock,
                } as Product;
              }
            );
          }
        }

        // For carousel sections, fetch banner data
        // Assuming all carousels use the same `banner` table
        let bannerData: {
          [key: number]: { id: number; img: string; url: string | null }[];
        } = {};
        for (const carouselSection of carouselSections) {
          const { data: banners, error: bannerError } = await supabase
            .from("banner")
            .select("*")
            .eq("valid", true);

          if (bannerError) {
            console.error(
              `Error fetching banners for carouselSection ${carouselSection.id}`,
              bannerError
            );
          } else {
            bannerData[carouselSection.id] = (banners || [])
              .filter((item) => item.url)
              .map((item) => ({
                id: item.id,
                img: item.url,
                url: item.page_url,
              }));
          }
        }

        // Attach offers to their respective product_list sections
        const sectionsWithData = sectionsData.map((section: HomeSection) => {
          if (section.type === "product_list") {
            return {
              ...section,
              offers: section.offer_ids
                ? offersWithPrimaryVariation.filter((product) =>
                    section.offer_ids?.includes(product.id)
                  )
                : [],
            };
          } else if (section.type === "carousel") {
            debugger;
            return {
              ...section,
              banners: bannerData[section.id] || [],
            };
          } else if (section.type === "half_banners") {
            debugger;
            return {
              ...section,

              banners: bannerData[48] || [],
            };
          }
          return section;
        });
        setSections(sectionsWithData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching home data:", err);
        setError("Failed to load home page data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main>
      {/* <CourseCard /> */}

      {sections.map((section, i) => {
        <>{i}sldfkjsldfj</>;
        if (section.type === "carousel") {
          // Render Carousel component
          return (
            <div key={section.id} className="mb-8">
              {section.banners && section.banners.length > 0 ? (
                <Carousel slides={section.banners} />
              ) : (
                <p>No banners available.</p>
              )}
            </div>
          );
        } else if (section.type === "product_list") {
          // Render ProductList component
          return (
            <div key={section.id} className="mb-8">
              {section.offers && section.offers.length > 0 ? (
                <ProductList name={section.title} products={section.offers} />
              ) : (
                <p>{section.no_product_message || "No products found."}</p>
              )}
            </div>
          );
        } else if (section.type === "half_banners") {
          // Render ProductList component
          return (
            <div key={section.id} className="mb-8">
              {section.banners && section.banners.length > 0 ? (
                <HalfBanners slides={section.banners} />
              ) : (
                <p>No banners available.</p>
              )}
            </div>
          );
        } else {
          // In case of an unknown type
          return null;
        }
      })}

      {/* Render CourseList only in development mode */}
      {(environment === "development") && <CourseList /> }
    </main>
  );
};

export default HomePage;
