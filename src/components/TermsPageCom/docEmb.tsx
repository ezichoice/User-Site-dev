"use client";
import React, { useEffect, useState } from "react";
import "./style.css";

interface DocEmbProps {
  documentType: "privacy" | "tos" | "aup" | "return";
  gettermsId?: string;
  language?: string;
}

const DocEmb: React.FC<DocEmbProps> = ({
  documentType,
  gettermsId = "dFMi8",
  language = "en-us",
}) => {
  const [iframeHeight, setIframeHeight] = useState("500px");

  useEffect(() => {
    // Load GetTerms script
    const script = document.createElement("script");
    script.src = "https://app.getterms.io/dist/js/embed.js";
    script.async = true;
    document.body.appendChild(script);

    // Setup message listener for iframe resizing
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "getterms-resize") {
        setIframeHeight(`${event.data.height}px`);
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      document.body.removeChild(script);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="getterms-wrapper customDiv">
      <div
        className="getterms-document-embed"
        data-getterms={gettermsId}
        data-getterms-document={documentType}
        data-getterms-lang={language}
        data-getterms-mode="direct"
      />
    </div>
  );
};

export default DocEmb;
