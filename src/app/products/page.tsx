import AllProductList from "@/components/shopPageCom/allProductList";
import React from "react";

function Page({ searchParams }: { searchParams: any }) {
  return (
    <div>
      <AllProductList initialSearchParams={searchParams} />
    </div>
  );
}

export default Page;
