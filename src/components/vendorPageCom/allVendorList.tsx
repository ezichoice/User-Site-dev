"use client";
import { supabase } from "@/lib/supabase";
import { Vendor } from "@/types/vendor";
import { useEffect, useState } from "react";
import LoadingSpinner from "../loadingCom/LoadingSpinner";
import VendorList from "./vendorList";

export default function AllVendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string[]>([]);

  useEffect(() => {
    async function fetchVendors(): Promise<void> {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("admin")
          .select(
            ` id, company_name, profile_url, email, phone, category(name)`
          )
          .eq("is_approved", true)
          .eq("role", "vendor");

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setVendors(data as Vendor[]);
          let category: string[] = [];
          // dont get any duplicate category
          data.map((item: any) => {
            if (!category.includes(item.category.name)) {
              category.push(item.category?.name);
            }
            console.log(category.includes(item.category.name));
          });
          setCategory(category);
        } else {
          setVendors([]);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Vendor List */}
      <VendorList vendors={vendors} name="Vendors" category={category} />{" "}
      {/* Pass filtered vendors */}
    </div>
  );
}
