"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  interface FormValues {
    name: string;
    contact: string;
    company_name: string;
    company_phone_number: string;
    company_address: string;
    company_email_address: string;
    nature_of_business: string;
    business_registration?: File | null;
    bank_name: string;
    account_name: string;
    branch_name: string;
    account_number: string;
    how_did_you_know: string;
    agreement: boolean;
  }

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      contact: "",
      company_name: "",
      company_phone_number: "",
      company_address: "",
      company_email_address: "",
      nature_of_business: "",
      business_registration: null,
      bank_name: "",
      account_name: "",
      branch_name: "",
      account_number: "",
      how_did_you_know: "",
      agreement: false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      contact: Yup.string().required("Contact is required"),
      company_name: Yup.string().required("Company Name is required"),
      company_phone_number: Yup.string().required("Phone Number is required"),
      company_address: Yup.string().required("Address is required"),
      company_email_address: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      nature_of_business: Yup.string().required(
        "Nature of Business is required"
      ),
      bank_name: Yup.string().required("Bank Name is required"),
      account_name: Yup.string().required("Account Name is required"),
      branch_name: Yup.string().required("Branch Name is required"),
      account_number: Yup.string().required("Account Number is required"),
      how_did_you_know: Yup.string().required("This field is required"),
      agreement: Yup.boolean().oneOf([true], "You must accept the agreement"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Handle file upload if a file is selected
        let businessRegistrationUrl = null;
        if (values.business_registration) {
          const file = values.business_registration;
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;

          // Upload the file to Supabase storage
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("inquiry").upload(fileName, file);

          if (uploadError) {
            throw new Error(`File upload failed: ${uploadError.message}`);
          }

          // Generate a signed URL for the uploaded file
          const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
              .from("inquiry")
              .createSignedUrl(fileName, 60 * 60 * 24 * 7); // URL valid for 7 days

          if (signedUrlError) {
            throw new Error(
              `Generating signed URL failed: ${signedUrlError.message}`
            );
          }

          businessRegistrationUrl = signedUrlData.signedUrl;
        }

        const { error } = await supabase.from("vendorInquery").insert([
          {
            name: values.name,
            contact: values.contact,
            company_name: values.company_name,
            company_phone_number: values.company_phone_number,
            company_address: values.company_address,
            company_email_address: values.company_email_address,
            nature_of_business: values.nature_of_business,
            business_registration: businessRegistrationUrl,
            bank_name: values.bank_name,
            account_name: values.account_name,
            branch_name: values.branch_name,
            account_number: values.account_number,
            how_did_you_know: values.how_did_you_know,
            agreement: values.agreement,
          },
        ]);

        if (error) {
          setErrorMessage("Error registering business, please try again.");
        } else {
          setIsSubmitted(true);
        }
      } catch (err) {
        setErrorMessage("Failed to submit the form, please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {isSubmitted ? (
          <div className="bg-white p-10 rounded-xl shadow-lg flex flex-col items-center">
            <img src="/logo.png" alt="Logo" className="h-12 mb-4" />
            <img
              src="/success.png"
              alt="Success"
              className="w-24 h-24 mb-4 animate-bounce"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Registration Successful!
            </h2>
            <p className="text-center text-gray-600">
              Your registration has been submitted. We will contact you as soon
              as possible!
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Back to Home
            </a>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
              Register Your Business
            </h2>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="John Doe"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.name}
                    </p>
                  )}
                </div>
                {/* Contact */}
                <div>
                  <label
                    htmlFor="contact"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Contact
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formik.values.contact}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.contact && formik.errors.contact
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="(123) 456-7890"
                  />
                  {formik.touched.contact && formik.errors.contact && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.contact}
                    </p>
                  )}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label
                    htmlFor="company_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formik.values.company_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.company_name && formik.errors.company_name
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Your Company LLC"
                  />
                  {formik.touched.company_name &&
                    formik.errors.company_name && (
                      <p className="mt-2 text-sm text-red-600">
                        {formik.errors.company_name}
                      </p>
                    )}
                </div>
                {/* Company Phone Number */}
                <div>
                  <label
                    htmlFor="company_phone_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Phone Number
                  </label>
                  <input
                    type="text"
                    id="company_phone_number"
                    name="company_phone_number"
                    value={formik.values.company_phone_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.company_phone_number &&
                      formik.errors.company_phone_number
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="(098) 765-4321"
                  />
                  {formik.touched.company_phone_number &&
                    formik.errors.company_phone_number && (
                      <p className="mt-2 text-sm text-red-600">
                        {formik.errors.company_phone_number}
                      </p>
                    )}
                </div>
              </div>

              {/* Third Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Address */}
                <div>
                  <label
                    htmlFor="company_address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Address
                  </label>
                  <input
                    type="text"
                    id="company_address"
                    name="company_address"
                    value={formik.values.company_address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.company_address &&
                      formik.errors.company_address
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="123 Business Rd."
                  />
                  {formik.touched.company_address &&
                    formik.errors.company_address && (
                      <p className="mt-2 text-sm text-red-600">
                        {formik.errors.company_address}
                      </p>
                    )}
                </div>
                {/* Company Email Address */}
                <div>
                  <label
                    htmlFor="company_email_address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Company Email Address
                  </label>
                  <input
                    type="email"
                    id="company_email_address"
                    name="company_email_address"
                    value={formik.values.company_email_address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.company_email_address &&
                      formik.errors.company_email_address
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="contact@company.com"
                  />
                  {formik.touched.company_email_address &&
                    formik.errors.company_email_address && (
                      <p className="mt-2 text-sm text-red-600">
                        {formik.errors.company_email_address}
                      </p>
                    )}
                </div>
              </div>

              {/* Nature of Business */}
              <div>
                <label
                  htmlFor="nature_of_business"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nature of Business
                </label>
                <input
                  type="text"
                  id="nature_of_business"
                  name="nature_of_business"
                  value={formik.values.nature_of_business}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`appearance-none block w-full px-4 py-3 border ${
                    formik.touched.nature_of_business &&
                    formik.errors.nature_of_business
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Retail, Manufacturing"
                />
                {formik.touched.nature_of_business &&
                  formik.errors.nature_of_business && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.nature_of_business}
                    </p>
                  )}
              </div>

              {/* Business Registration Upload (Optional) */}
              <div>
                <label
                  htmlFor="business_registration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Registration (Optional)
                </label>
                <input
                  type="file"
                  id="business_registration"
                  name="business_registration"
                  onChange={(event) => {
                    const files = event.currentTarget.files;
                    if (files && files[0]) {
                      formik.setFieldValue("business_registration", files[0]);
                    } else {
                      formik.setFieldValue("business_registration", null);
                    }
                  }}
                  className="block w-full text-sm text-gray-700"
                />
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Name */}
                <div>
                  <label
                    htmlFor="bank_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bank Name
                  </label>
                  <input
                    type="text"
                    id="bank_name"
                    name="bank_name"
                    value={formik.values.bank_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.bank_name && formik.errors.bank_name
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formik.touched.bank_name && formik.errors.bank_name && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.bank_name}
                    </p>
                  )}
                </div>
                {/* Account Name */}
                <div>
                  <label
                    htmlFor="account_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Account Name
                  </label>
                  <input
                    type="text"
                    id="account_name"
                    name="account_name"
                    value={formik.values.account_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.account_name && formik.errors.account_name
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formik.touched.account_name &&
                    formik.errors.account_name && (
                      <p className="mt-2 text-sm text-red-600">
                        {formik.errors.account_name}
                      </p>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Branch Name */}
                <div>
                  <label
                    htmlFor="branch_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Branch Name
                  </label>
                  <input
                    type="text"
                    id="branch_name"
                    name="branch_name"
                    value={formik.values.branch_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.branch_name && formik.errors.branch_name
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formik.touched.branch_name && formik.errors.branch_name && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.branch_name}
                    </p>
                  )}
                </div>
                {/* Account Number */}
                <div>
                  <label
                    htmlFor="account_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="account_number"
                    name="account_number"
                    value={formik.values.account_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      formik.touched.account_number &&
                      formik.errors.account_number
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {formik.touched.account_number &&
                    formik.errors.account_number && (
                      <p className="mt-2 text-sm text-red-600">
                        {formik.errors.account_number}
                      </p>
                    )}
                </div>
              </div>

              {/* How Did You Know Us */}
              <div>
                <label
                  htmlFor="how_did_you_know"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  How did you know us?
                </label>
                <select
                  id="how_did_you_know"
                  name="how_did_you_know"
                  value={formik.values.how_did_you_know}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`appearance-none block w-full px-4 py-3 border ${
                    formik.touched.how_did_you_know &&
                    formik.errors.how_did_you_know
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select an option</option>
                  <option value="social_media">Social Media</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
                {formik.touched.how_did_you_know &&
                  formik.errors.how_did_you_know && (
                    <p className="mt-2 text-sm text-red-600">
                      {formik.errors.how_did_you_know}
                    </p>
                  )}
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreement"
                  name="agreement"
                  checked={formik.values.agreement}
                  onChange={formik.handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="agreement"
                  className="ml-2 block text-sm text-gray-900"
                >
                  I agree to join with the agreement policy
                </label>
              </div>
              {formik.touched.agreement && formik.errors.agreement && (
                <p className="mt-2 text-sm text-red-600">
                  {formik.errors.agreement}
                </p>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="text-red-600 text-center">{errorMessage}</div>
              )}

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
                    isLoading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out`}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register Business"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
