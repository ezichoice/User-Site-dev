import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { CourseProvider } from "@/context/courseContext"; // Import CourseProvider
import NavBar from "@/components/navBar";
import Footer from "@/components/footer";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CartProvider } from "@/context/cartContext";
import { VendorProvider } from "@/context/vendorContext";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });
const GA_TRACKING_ID = "G-S29XE8NRTK"; // Replace with your tracking ID

export const metadata: Metadata = {
  title: "Grab your offers in one click - Ezi Choice",
  description: "Your interest is our concern. Search all offers in Sri Lanka with ease and convenience.",
  keywords: ["offers", "Sri Lanka", "deals", "Ezi Choice", "discounts", "promotions"],
  authors: [{ name: "Ezichoice", url: "https://ezichoice.lk" }],
  openGraph: {
    title: "Grab your offers in one click - Ezi Choice",
    description: "Your interest is our concern. Search all offers in Sri Lanka with ease and convenience.",
    url: "https://ezichoice.lk",
    siteName: "Ezi Choice",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Ezi Choice Logo" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grab your offers in one click - Ezi Choice",
    description: "Your interest is our concern. Search all offers in Sri Lanka with ease and convenience.",
    images: ["/logo.png"],
    creator: "@YourTwitterHandle",
  },
  robots: "index, follow",
  alternates: { canonical: "https://ezichoice.lk" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <body className={inter.className}>
        <AuthProvider>
          <VendorProvider>
            <CartProvider>
              <CourseProvider> {/* Wrap your app with CourseProvider */}
                <NavBar />
                <div className="container mx-auto md:px-4 md:py-4">{children}</div>
                <Footer />
              </CourseProvider>
            </CartProvider>
          </VendorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
