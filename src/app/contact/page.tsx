"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useFormik } from "formik";
import * as Yup from "yup";

const ContactUsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Define Formik instance
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

      try {
        const { error } = await supabase.from("contactInquiry").insert([
          {
            name: values.name,
            email: values.email,
            message: values.message,
          },
        ]);

        if (error) {
          setErrorMessage("Failed to submit. Please try again.");
        } else {
          setIsSubmitted(true);
        }
      } catch (error) {
        setErrorMessage("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Contact Us
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Get in Touch
            </h2>

            {isSubmitted ? (
              <p className="text-green-600 font-semibold">
                Thank you! Your message has been submitted successfully.
              </p>
            ) : (
              <>
                <div className="space-y-4">
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
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => formik.handleSubmit()} // Trigger form submission manually
                  className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </button>

                {/* Error Message */}
                {errorMessage && (
                  <p className="text-red-600 mt-4">{errorMessage}</p>
                )}
              </>
            )}
          </div>

          {/* Contact Details */}
          <div className="flex flex-col justify-between bg-white shadow-md rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Contact Information
              </h2>
              <p className="text-gray-600">
                We would love to hear from you! Here’s how you can reach us...
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Icon icon="tabler:location-filled" className="mr-2 text-xl text-gray-800" />
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
                  <Icon icon="ic:round-email" className="mr-2 text-xl text-gray-800" />
                  Email
                </h3>
                <div className="pl-7">
                  <p className="text-gray-600 flex items-center">support@ezichoice.lk</p>
                </div>
               </div>
              </div>
              <div className="flex items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Icon icon="ic:round-phone" className="mr-2 text-xl text-gray-800" />
                  Phone
                </h3>
                <div className="pl-7">
                  <p className="text-gray-600 flex items-center">
                    <span className="font-medium w-20">Mobile</span> 
                    <span>: 077-479-6357</span>
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
    </div>
  );
};

export default ContactUsPage;
