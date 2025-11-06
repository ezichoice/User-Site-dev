"use client";
import { useFormik } from "formik";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import * as Yup from "yup";

const Vendor: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      message: Yup.string().required("Message is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMessage("");
      setIsSubmitted(false); // reset submission state when re-submitting

      try {
        const { error } = await supabase.from("contactInquiry").insert([
          {
            name: values.name,
            email: values.email,
            message: values.message,
            from: "vendor",
          },
        ]);

        if (error) {
          setErrorMessage("Failed to submit. Please try again.");
        } else {
          setIsSubmitted(true);
          formik.resetForm();
        }
      } catch (error) {
        setErrorMessage("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-indigo-100 text-gray-800">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="container mx-auto text-center px-6">
            <h1 className="text-6xl font-extrabold mb-6 animate-fade-in">
              Become a Vendor with EziChoice
            </h1>
            <p className="text-2xl md:text-3xl max-w-4xl mx-auto leading-relaxed">
              Expand your reach and grow your customer base by partnering with
              EziChoice. Join a thriving platform and watch your business soar!
            </p>
            <a
              href="/register/vendor"
              className="inline-block px-10 py-4 mt-8 bg-white text-purple-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition duration-300"
            >
              Get Started Today
            </a>
          </div>
        </section>
        <section className="py-24 bg-gradient-to-r from-indigo-100 to-blue-200">
          <div className="container mx-auto text-center px-6">
            <h2 className="text-5xl font-extrabold mb-12 text-gray-800">
              Why Partner with EziChoice?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
                <img
                  src="/vendor/icon1.png"
                  alt="Online Store"
                  className="w-full aspect-w-16 aspect-h-9 mb-6 rounded-lg object-cover"
                />
                <h3 className="text-3xl font-bold mb-4">
                  Open Your Online Store
                </h3>
                <p className="text-lg text-gray-600">
                  Set up your online store easily on the EziChoice platform and
                  showcase your products to a wider audience.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
                <img
                  src="/vendor/icon3.png"
                  alt="Promote Offers"
                  className="w-full aspect-w-16 aspect-h-9 mb-6 rounded-lg object-cover"
                />
                <h3 className="text-3xl font-bold mb-4">
                  Promote Your Store Offers
                </h3>
                <p className="text-lg text-gray-600">
                  Easily highlight and promote exclusive deals, discounts, and
                  special promotions on our platform.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
                <img
                  src="/vendor/icon2.png"
                  alt="Booking System"
                  className="w-full aspect-w-16 aspect-h-9 mb-6 rounded-lg object-cover"
                />
                <h3 className="text-3xl font-bold mb-4">
                  Access to a Booking System
                </h3>
                <p className="text-lg text-gray-600">
                  Manage bookings and appointments seamlessly through our
                  integrated booking system.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
                <img
                  src="/vendor/icon4.png"
                  alt="Sell Gifts"
                  className="w-full aspect-w-16 aspect-h-9 mb-6 rounded-lg object-cover"
                />
                <h3 className="text-3xl font-bold mb-4">
                  Sell Gifts with Ease
                </h3>
                <p className="text-lg text-gray-600">
                  Allow customers to easily send your products as gifts,
                  offering a personalized shopping experience.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
                <img
                  src="/vendor/icon5.png"
                  alt="Sell Event Tickets"
                  className="w-full aspect-w-16 aspect-h-9 mb-6 rounded-lg object-cover"
                />
                <h3 className="text-3xl font-bold mb-4">Sell Event Tickets</h3>
                <p className="text-lg text-gray-600">
                  Easily sell tickets for your events directly through the
                  EziChoice platform.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
                <img
                  src="/vendor/icon6.png"
                  alt="Business Growth"
                  className="w-full aspect-w-16 aspect-h-9 mb-6 rounded-lg object-cover"
                />
                <h3 className="text-3xl font-bold mb-4">
                  Boost Your Business Growth
                </h3>
                <p className="text-lg text-gray-600">
                  Take advantage of exclusive promotions and increased
                  visibility to grow your customer base and boost sales.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Featured Benefits Section */}
        <section className="py-24 bg-gray-100">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-5xl font-extrabold mb-12 text-gray-800">
              Benefits of Joining Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 text-white">
                <h3 className="text-4xl font-bold mb-6">Visibility Boost</h3>
                <p className="text-lg">
                  Gain exposure to thousands of customers actively searching for
                  deals and unique experiences.
                </p>
              </div>
              <div className="p-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 text-white">
                <h3 className="text-4xl font-bold mb-6">
                  Streamlined Marketing
                </h3>
                <p className="text-lg">
                  Leverage EziChoice’s platform for strategic marketing
                  opportunities to skyrocket your sales.
                </p>
              </div>
              <div className="p-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 text-white">
                <h3 className="text-4xl font-bold mb-6">
                  Simplified Logistics
                </h3>
                <p className="text-lg">
                  Let us handle logistics like payments and bookings so you can
                  focus on growing your business.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* How to Get Started Section */}
        <section
          id="get-started"
          className="py-24 bg-gradient-to-r from-blue-100 to-indigo-100"
        >
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-5xl font-extrabold mb-12 text-gray-800">
              How to Get Started
            </h2>
            <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
              Follow these steps to become a part of the EziChoice platform and
              grow your business!
            </p>

            <div className="relative">
              {/* Vertical Timeline - Hidden on Mobile */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-600"></div>

              <div className="flex flex-col space-y-12">
                {/* Step 1 */}
                <div className="relative flex md:block flex-col md:flex-row md:items-center">
                  <div className="flex justify-center items-center w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg mx-auto md:order-1 transition-transform transform hover:scale-110">
                    1
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-lg md:w-1/2 mx-auto md:ml-0 hover:bg-purple-100 transition duration-300">
                    <h3 className="text-3xl font-bold mb-4">Sign Up</h3>
                    <p className="text-lg text-gray-600">
                      Register your business through our user-friendly platform
                      and create your vendor profile.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex md:block flex-col md:flex-row-reverse md:items-center">
                  <div className="flex justify-center items-center w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg mx-auto md:order-1 transition-transform transform hover:scale-110">
                    2
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-lg md:w-1/2 mx-auto md:mr-0 hover:bg-purple-100 transition duration-300">
                    <h3 className="text-3xl font-bold mb-4">
                      Set Up Your Offers
                    </h3>
                    <p className="text-lg text-gray-600">
                      List your products, services, or event packages, and
                      create exclusive promotions that appeal to your target
                      audience.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex md:block flex-col md:flex-row md:items-center">
                  <div className="flex justify-center items-center w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg mx-auto md:order-1 transition-transform transform hover:scale-110">
                    3
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-lg md:w-1/2 mx-auto md:ml-0 hover:bg-purple-100 transition duration-300">
                    <h3 className="text-3xl font-bold mb-4">Start Selling</h3>
                    <p className="text-lg text-gray-600">
                      After approval, your products and services will be
                      featured on our platform. Start receiving orders and
                      bookings right away!
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex md:block flex-col md:flex-row-reverse md:items-center">
                  <div className="flex justify-center items-center w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg mx-auto md:order-1 transition-transform transform hover:scale-110">
                    4
                  </div>
                  <div className="bg-white p-8 rounded-lg shadow-lg md:w-1/2 mx-auto md:mr-0 hover:bg-purple-100 transition duration-300">
                    <h3 className="text-3xl font-bold mb-4">
                      Manage Your Business
                    </h3>
                    <p className="text-lg text-gray-600">
                      Use our vendor dashboard to track your sales, manage
                      offers, and monitor your business’s performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="/register/vendor"
              className="inline-block px-12 py-4 mt-12 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 hover:scale-105 transition duration-300"
            >
              Join EziChoice Today
            </a>
          </div>
        </section>

        {/* Contact form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 py-4 bg-white shadow-sm rounded-lg">
          <div className="py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Get in Touch
            </h2>

            <div className="space-y-4">
              {isSubmitted ? (
                <p className="text-green-600 mt-4">
                  Your message has been sent successfully!
                </p>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.name && formik.errors.name ? (
                      <div className="text-red-600">{formik.errors.name}</div>
                    ) : null}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="you@example.com"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email ? (
                      <div className="text-red-600">{formik.errors.email}</div>
                    ) : null}
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your Message"
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    ></textarea>
                    {formik.touched.message && formik.errors.message ? (
                      <div className="text-red-600">
                        {formik.errors.message}
                      </div>
                    ) : null}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={() => formik.handleSubmit()}
                    className="w-full py-2 px-4
               bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                  </button>

                  {/* Error message */}
                  {errorMessage && (
                    <p className="text-red-600 mt-4">{errorMessage}</p>
                  )}

                  {/* Success message */}
                </>
              )}
            </div>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col justify-between bg-white shadow-md rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600">
                For more information on becoming a vendor, contact our support
                team today.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Icon
                      icon="tabler:location-filled"
                      className="mr-2 text-xl text-gray-800"
                    />
                    Location
                  </h3>
                  <div className="pl-7">
                    <p className="text-gray-600 flex items-center">
                      Ezichoice (Pvt) Ltd. <br />
                      Level 35, <br />
                      West Tower,
                      <br />
                      World Trade Center,
                      <br />
                      Colombo – 01,
                      <br />
                      Sri Lanka.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Icon
                      icon="ic:round-email"
                      className="mr-2 text-xl text-gray-800"
                    />
                    Email
                  </h3>
                  <div className="pl-7">
                    <p className="text-gray-600 flex items-center">
                      vendors@ezichoice.lk
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Icon
                      icon="ic:round-phone"
                      className="mr-2 text-xl text-gray-800"
                    />
                    Phone
                  </h3>
                  <div className="pl-7">
                    <p className="text-gray-600 flex items-center">
                      <span className="font-medium w-20">Mobile</span>
                      <span>: 077-476-9727</span>
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <span className="font-medium w-20">Landline</span>
                      <span>: 011-753-7354</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Google Maps Embed */}
            <div className="mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Find Us Here
              </h2>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.6439293655876!2d79.8411008739977!3d6.9330919930668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25900625bef27%3A0xe03e25834d79f1cd!2sWorld%20Trade%20Center%20-%20West%20tower!5e0!3m2!1sen!2slk!4v1728307746647!5m2!1sen!2slk"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Vendor;
