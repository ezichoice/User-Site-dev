import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
          <div className=" col-span-2 md:col-span-3">
            <h5 className="text-sm md:text-lg font-bold">EziChoice</h5>
            <p className="text-xs md:text-sm mt-2">
              © 2024 EziChoice. All rights reserved.
            </p>
          </div>
          <div className=" md:col-span-2">
            <h6 className="text-sm md:text-base font-semibold mb-3">
              Business
            </h6>
            <ul className="space-y-2">
              <li>
                <a
                  href="/vendors/new"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  Become a vendor
                </a>
              </li>
              <li>
                <a
                  href="https://app.ezichoice.lk/login"
                  target="_blank"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  Vendor Sign in
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h6 className="text-sm md:text-base font-semibold mb-3">Private</h6>
            <ul className="space-y-2">
              <li>
                <a
                  href="/auth/login"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  Sign-in
                </a>
              </li>
              <li>
                <a
                  href="/vendors"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  All Vendors
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  Customer Support
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h6 className="text-sm md:text-base font-semibold mb-3">Company</h6>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  About Ezichoice
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h6 className="text-sm md:text-base font-semibold mb-3">
              Policies
            </h6>
            <ul className="space-y-2">
              <li>
                <a
                  href="/terms"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="/return"
                  className="text-xs md:text-sm hover:text-gray-300 hover:underline"
                >
                  Return Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
