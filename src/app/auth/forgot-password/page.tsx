"use client";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { checkExistingEmail } from "@/utils/actions/storage";
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";

export default function ForgotPassword() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || null;
  const router = useRouter();

  const { userDetails } = useAuth();
  const [loggedInEmail, setLoggedInEmail] = useState<string>("");

  useEffect(() => {
    if (userDetails?.email)
      setLoggedInEmail(userDetails?.email);
  }, [userDetails?.email]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: loggedInEmail,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // When the user requests for forgot password, check if the email is already registered.
        // If not registered, throw a field error and return.
        if (!from) {
          const { data: existingUser, error: authError } = await checkExistingEmail(values.email);

          // authError will be set only if error is set while listing registered users in server action.
          if (authError) {
            toast.error(authError?.message || "Unexpected error while checking registered users. Please try again", {
              position: "top-right",
              autoClose: 3000,
            });
            return;
          }

          // if the entered email is not registered, then existingUser.email is null.
          // set field error and return.
          if (!existingUser.email) {
            formik.setFieldError("email", "The email is not registered.");
            return;
          } else if (existingUser.provider !== "email") {
            formik.setFieldError("email", `No password reset for users signed in with ${existingUser.provider?.toUpperCase()}`);
            return;
          }
            
        }
        
        const { data, error } = await supabase.auth.resetPasswordForEmail(
          values.email,
          {
            redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/api/reset-password`, // The page where user will reset the password
          }
        );

        if (error) {
          toast.error(error.message, {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        } else {
          toast.success("Password reset email sent. Please check your inbox!", {
            position: "top-right",
            autoClose: 3000,
          });
        }
        router.push("/auth/login");
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Error sending reset email", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-4 lg:px-8">
        <div className="border-2 sm:mx-auto sm:w-full sm:max-w-sm p-3 rounded-md">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Image
              className="mx-auto h-10 w-auto"
              src="/logo.png"
              alt="Ezichoice"
              height={10}
              width={10}
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              {from ? "Change your password": "Forgot your password?"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {from ? "On clicking Send reset link, the email is sent to this Email address": "Enter your email address below to reset your password."}
            </p>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                    className={`block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${
                      formik.touched.email && formik.errors.email
                        ? "ring-red-500"
                        : ""
                    }`}
                    disabled={!!loggedInEmail}
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <div className="mt-2 text-sm text-red-600">
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {formik.isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </div>
            </form>

            {!from && <p className="mt-10 text-center text-sm text-gray-500">
              Remember your password?{" "}
              <a
                href="/auth/login"
                className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
              >
                Login
              </a>
            </p>}
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
