"use client";

import AppleLoginButton from "@/components/loginPageCom/appleLoginButton";
import GoogleLoginButton from "@/components/loginPageCom/googleLoginButton";
import { supabase } from "@/lib/supabase";
import { useFormik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";

export default function LoginPage() {
  const router = useRouter();

  // Form validation schema using Yup
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Required"),
  });

  // Formik for form handling
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          toast.error(error.message, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          toast.success("Login successful!", {
            position: "top-right",
            autoClose: 3000,
          });
          router.push("/");
        }
      } catch (error) {
        toast.error("Login failed", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center">
          <Image
            className="mx-auto h-16 w-auto"
            src="/logo.png"
            alt="Ezichoice"
            height={16}
            width={16}
          />
          <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Login to your account
          </h2>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6 py-3 mt-10">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address <span className="text-red-600">*</span>
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                autoComplete="email"
                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                  formik.touched.email && formik.errors.email
                    ? "ring-red-500"
                    : ""
                }`}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="mt-2 text-sm text-red-600">
                  {formik.errors.email}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password <span className="text-red-600">*</span>
              </label>
              <div className="text-sm">
                <Link
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/forgot-password`}
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                autoComplete="current-password"
                className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                  formik.touched.password && formik.errors.password
                    ? "ring-red-500"
                    : ""
                }`}
              />
              {formik.touched.password && formik.errors.password && (
                <div className="mt-2 text-sm text-red-600">
                  {formik.errors.password}
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {formik.isSubmitting ? "Submitting..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center items-center pt-3 gap-4">
          <GoogleLoginButton />
          <AppleLoginButton />
          {/* <FacebookLoginButton /> */}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/register"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Create Now
          </a>
        </p>
      </div>

      {/* Toast container for notifications */}
      <ToastContainer />
    </div>
  );
}
