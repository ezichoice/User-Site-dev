"use client";

import { Product } from "@/app/modals/Product";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipLoader } from "react-spinners";
import ProductCard from "../productCard";
import FilterOption from "./filterOptions"; // Adjust the import path as needed

// Define the shape of a Category, including optional fields
interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  path: string;
  created_at: string;
  valid: boolean;
  img?: string;
  icon: string;
}

// A Category node that can have children
interface CategoryNode extends Category {
  children: CategoryNode[];
}

// The shape of our `initialSearchParams` prop. Note that in Next.js 13
// query parameters can come in as `string | string[] | undefined`.
interface SearchParams {
  [key: string]: string | string[] | undefined;
}

interface AllProductListProps {
  // Accepting the search params from the parent or server component
  initialSearchParams: SearchParams;
}

export default function AllProductList({
  initialSearchParams,
}: AllProductListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [checkedCategories, setCheckedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // New states for price range
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const observer = useRef<IntersectionObserver | null>(null);
  const today = new Date();
  const [paramsLoaded, setParamsLoaded] = useState(false);

  // NEW: State for category tree
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);

  // NEW: State for mobile drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────────
  // 1. Initialize local state from query params
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // On component mount or when URL changes, update states from URL
    

    // Category param can be string, string[], or undefined
    const categoryParam = initialSearchParams.category;
    let categoriesFromURL: number[] = [];

    // Safely handle categoryParam
    if (typeof categoryParam === "string") {
      // If it's a single string, just split it
      categoriesFromURL = categoryParam
        .split(",")
        .map((catStr) => Number(catStr.trim()))
        .filter((catId) => !isNaN(catId));
    } else if (Array.isArray(categoryParam)) {
      // If it's an array, take the first element (typical Next.js behavior)
      // and do the same splitting logic
      categoriesFromURL = categoryParam[0]
        .split(",")
        .map((catStr) => Number(catStr.trim()))
        .filter((catId) => !isNaN(catId));
    }

    setCheckedCategories(categoriesFromURL);

    // Search param can be string, string[], or undefined
    const searchParam = initialSearchParams.search;
    if (typeof searchParam === "string") {
      setSearchTerm(searchParam);
    } else if (Array.isArray(searchParam)) {
      // If there's more than one, pick the first
      setSearchTerm(searchParam[0]);
    } else {
      setSearchTerm("");
    }

    // Handle minPrice & maxPrice
    const minPriceParam = initialSearchParams.minPrice;
    if (typeof minPriceParam === "string") {
      const parsedMin = Number(minPriceParam);
      setMinPrice(!isNaN(parsedMin) ? parsedMin : undefined);
    } else if (Array.isArray(minPriceParam)) {
      const parsedMin = Number(minPriceParam[0]);
      setMinPrice(!isNaN(parsedMin) ? parsedMin : undefined);
    } else {
      setMinPrice(undefined);
    }

    const maxPriceParam = initialSearchParams.maxPrice;
    if (typeof maxPriceParam === "string") {
      const parsedMax = Number(maxPriceParam);
      setMaxPrice(!isNaN(parsedMax) ? parsedMax : undefined);
    } else if (Array.isArray(maxPriceParam)) {
      const parsedMax = Number(maxPriceParam[0]);
      setMaxPrice(!isNaN(parsedMax) ? parsedMax : undefined);
    } else {
      setMaxPrice(undefined);
    }

    setPage(0);
    setParamsLoaded(true);
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // 2. Fetch products whenever a relevant dependency changes
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Fetch products only if params are loaded
    if (!paramsLoaded) return;
    debugger;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const todayString = today.toISOString();

      let query = supabase
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
            is_approved
          )
        `
        )
        .eq("is_approved", true)
        .lte("start_date", todayString)
        .gte("end_date", todayString)
        .not("admin", "is", null)
        .order("id", { ascending: false }) // e.g. newest first
        .range(page * 10, (page + 1) * 10 - 1);

      if (checkedCategories.length > 0) {
        query = query.in("category", checkedCategories);
      }

      if (debouncedSearchTerm) {
        query = query.ilike("name", `%${debouncedSearchTerm}%`);
      }

      // Price range filters
      if (minPrice !== undefined) {
        query = query.gte("offerVariations.offer_price", minPrice);
      }
      if (maxPrice !== undefined) {
        query = query.lte("offerVariations.offer_price", maxPrice);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        const productsData: Product[] = data
          .filter((offer: any) => offer.offerVariations.length > 0)
          .map((offer: any) => {
            const firstVariation = offer.offerVariations[0];
            return {
              id: offer.id,
              name: firstVariation.name || offer.name,
              vendor_name: offer.admin?.company_name || "Unknown Vendor",
              vendor_img: offer.admin?.profile_url || "",
              rating: offer.rating || 0,
              offer_price: firstVariation.offer_price || 0,
              actual_price: firstVariation.actual_price || 0,
              img_url: firstVariation.img_url || offer.img_url || "",
              offer_variation_id: firstVariation.id,
              is_in_stock: offer.is_in_stock,
            };
          });

        setProducts((prev) =>
          page === 0 ? productsData : [...prev, ...productsData]
        );
        setHasMore(data.length === 10);
      }

      setLoading(false);
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    checkedCategories,
    debouncedSearchTerm,
    minPrice,
    maxPrice,
    paramsLoaded,
  ]);

  // ─────────────────────────────────────────────────────────────────
  // 3. Load existing search history from sessionStorage
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const history = JSON.parse(sessionStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history);
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // 4. Debounce the searchTerm to avoid spamming queries
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // ─────────────────────────────────────────────────────────────────
  // 5. Persist searchTerm in search history (sessionStorage)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedSearchTerm) {
      const history = JSON.parse(
        sessionStorage.getItem("searchHistory") || "[]"
      ) as string[];
      if (!history.includes(debouncedSearchTerm)) {
        const updatedHistory = [...history, debouncedSearchTerm];
        sessionStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
        setSearchHistory(updatedHistory);
      }
    }
  }, [debouncedSearchTerm]);

  // ─────────────────────────────────────────────────────────────────
  // 6. Fetch categories (only once)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("category")
        .select("*")
        .eq("valid", true);

      if (error) {
        setError(error.message);
      } else if (data) {
        setCategories(data as Category[]);
      }
    };
    fetchCategories();
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // 7. Build category tree once we have categories
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (categories.length > 0) {
      const buildCategoryTree = (cats: Category[]): CategoryNode[] => {
        const categoryMap: { [key: number]: CategoryNode } = {};
        cats.forEach((cat) => {
          categoryMap[cat.id] = { ...cat, children: [] };
        });

        const roots: CategoryNode[] = [];
        Object.values(categoryMap).forEach((cat) => {
          if (cat.parent_id) {
            if (categoryMap[cat.parent_id]) {
              categoryMap[cat.parent_id].children.push(cat);
            }
          } else {
            roots.push(cat);
          }
        });
        return roots;
      };
      setCategoryTree(buildCategoryTree(categories));
    }
  }, [categories]);

  // ─────────────────────────────────────────────────────────────────
  // 8. Reflect filters in the URL (so refreshing keeps them)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!paramsLoaded) return;
    const params = new URLSearchParams();

    if (checkedCategories.length > 0) {
      params.set("category", checkedCategories.join(","));
    }

    if (searchTerm) {
      params.set("search", searchTerm);
    }

    if (minPrice !== undefined) {
      params.set("minPrice", minPrice.toString());
    }

    if (maxPrice !== undefined) {
      params.set("maxPrice", maxPrice.toString());
    }

    const currentParams = searchParams.toString();
    const newParams = params.toString();

    // Only update the router if the params have actually changed
    if (currentParams !== newParams) {
      router.replace(`?${newParams}`); // Shallow route to keep state
      setPage(0);
      setProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedCategories, debouncedSearchTerm, minPrice, maxPrice]);

  // ─────────────────────────────────────────────────────────────────
  // 9. Infinite scrolling observer
  // ─────────────────────────────────────────────────────────────────
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-12">
      {/* Mobile Filter Button */}
      <div className="md:hidden col-span-1 p-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-sm font-semibold flex items-center">
          <Icon icon="mdi:filter" className="w-4 h-4 mr-1" />
          Filter
        </h1>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Open filter drawer"
        >
          <Icon icon="mdi:filter-outline" className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Filter Sidebar */}
      <div className="hidden md:block md:col-span-2 p-4 border-r border-gray-200 sticky top-4 max-h-[90vh] overflow-y-auto">
        <FilterOption
          categoryTree={categoryTree}
          checkedCategories={checkedCategories}
          setCheckedCategories={setCheckedCategories}
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
        />
      </div>

      {/* Mobile Filter Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black opacity-30"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="relative bg-white w-3/4 max-w-xs h-full shadow-lg overflow-y-auto">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-label="Close filter drawer"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>

            <div className="p-4">
              <FilterOption
                categoryTree={categoryTree}
                checkedCategories={checkedCategories}
                setCheckedCategories={setCheckedCategories}
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
              />
            </div>
          </div>

          {/* Optional: Clickable area to close the drawer */}
          <div className="w-1/4" onClick={() => setIsDrawerOpen(false)}></div>
        </div>
      )}

      {/* Main Content */}
      <div className="col-span-12 md:col-span-10">
        <h1 className="p-4 text-sm font-semibold flex items-center">
          <Icon icon="mdi:shopping" className="w-5 h-5 mr-1" />
          Our Products
        </h1>

        {/* Search input */}
        <div className="p-4">
          <div className="relative">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-4 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Selected category and price range chips */}
          <div className="flex flex-wrap gap-1 mt-2">
            {checkedCategories.map((categoryId) => {
              const category = categories.find((cat) => cat.id === categoryId);
              return (
                <div
                  key={categoryId}
                  className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full shadow-md transition-transform duration-200 ease-in-out transform hover:scale-105 hover:bg-indigo-200"
                >
                  {category?.icon && (
                    <Icon
                      icon={category.icon}
                      className="text-xs text-indigo-600 mr-1 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-xxs font-semibold">
                    {category?.name}
                  </span>
                  <button
                    className="ml-2 flex items-center justify-center w-4 h-4 text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full transition-colors duration-200"
                    onClick={() =>
                      setCheckedCategories((prev) =>
                        prev.filter((id) => id !== categoryId)
                      )
                    }
                    aria-label={`Remove ${category?.name}`}
                  >
                    <Icon icon="mdi:close" className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* Price Range Chip */}
            {(minPrice !== undefined || maxPrice !== undefined) && (
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full shadow-md transition-transform duration-200 ease-in-out transform hover:scale-105 hover:bg-green-200">
                <span className="text-xs text-green-600 mr-1 flex-shrink-0">
                  ₨
                </span>
                <span className="text-xxs font-semibold">
                  {minPrice !== undefined ? `Min ₨${minPrice}` : "Min"}
                  {maxPrice !== undefined ? ` - ₨${maxPrice}` : ""}
                </span>
                <button
                  className="ml-2 flex items-center justify-center w-4 h-4 text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-full transition-colors duration-200"
                  onClick={() => {
                    setMinPrice(undefined);
                    setMaxPrice(undefined);
                  }}
                  aria-label={`Remove price range`}
                >
                  <Icon icon="mdi:close" className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products grid */}
        <div className="container mx-auto px-4 my-3 md:w-11/12">
          {loading ? (
            <div className="flex justify-center items-center my-4">
              <ClipLoader color="#36D7B7" size={30} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-gray-500 h-[300px] flex items-center justify-center">
              No offers found matching your criteria.
            </div>
          ): (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product, index) => {
                if (products.length === index + 1) {
                  return (
                    <div ref={lastProductElementRef} key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  );
                }
                return <ProductCard key={product.id} product={product} />;
              })}
            </div>
          )}
        </div>
        {error && (
          <div className="text-red-600 p-4 text-xs">Error: {error}</div>
        )}
      </div>
    </div>
  );
}
