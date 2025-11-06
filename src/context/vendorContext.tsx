"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase"; // Ensure you have Supabase instance configured

interface Vendor {
  id: string;
  name: string;
  profile_url: string;
  company_name: string;
  is_approved: boolean;
  district: string;
  description: string; // Add more fields based on your schema
}

interface VendorContextProps {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  fetchVendors: () => void;
  fetchVendorById: (id: string) => Promise<Vendor | null>;
  getCompanyNameById: (id: string) => Promise<string | null>; // Added this line
  getCompanyNamesByIds: (ids: string[]) => Promise<{ [key: string]: string }>; // New function

  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const VendorContext = createContext<VendorContextProps | undefined>(undefined);

export const VendorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin") // Assuming your vendor table is named 'admin'
        .select("*")
        .eq("is_approved", true)
        .range(page * 10, (page + 1) * 10 - 1);

      if (error) {
        setError(error.message);
      } else if (data) {
        setVendors((prev) => (page === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === 10);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchVendorById = useCallback(
    async (id: string): Promise<Vendor | null> => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("admin")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setError(error.message);
          return null;
        }
        return data as Vendor;
      } catch (error: any) {
        setError(error.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCompanyNameById = useCallback(
    async (id: string): Promise<string | null> => {
      // Optionally, you can handle loading state here if needed
      try {
        const { data, error } = await supabase
          .from("admin")
          .select("company_name")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching company name:", error.message);
          return null;
        }
        return data?.company_name || null;
      } catch (error: any) {
        console.error("Error fetching company name:", error.message);
        return null;
      }
    },
    []
  );
  const getCompanyNamesByIds = useCallback(
    async (ids: string[]): Promise<{ [key: string]: string }> => {
      try {
        const { data, error } = await supabase
          .from("admin")
          .select("id, company_name")
          .in("id", ids);

        if (error) {
          console.error("Error fetching company names:", error.message);
          return {};
        }

        const names = data.reduce(
          (acc: { [key: string]: string }, vendor: any) => {
            acc[vendor.id] = vendor.company_name;
            return acc;
          },
          {}
        );

        return names;
      } catch (error: any) {
        console.error("Error fetching company names:", error.message);
        return {};
      }
    },
    []
  );

  return (
    <VendorContext.Provider
      value={{
        vendors,
        loading,
        error,
        hasMore,
        page,
        fetchVendors,
        fetchVendorById,
        getCompanyNameById, // Included here
        getCompanyNamesByIds,
        setPage,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};

export const useVendorContext = (): VendorContextProps => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error("useVendorContext must be used within a VendorProvider");
  }
  return context;
};
