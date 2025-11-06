import DocEmb from "@/components/TermsPageCom/docEmb";
import React from "react";

export default function Page() {
  return (
    <>
      <div>
        <div className="w-10/12 mx-auto">
          <h1 className="text-4xl ml-0 mb-3">Return Policy</h1>
          <DocEmb documentType="return" />
        </div>
      </div>
    </>
  );
}
