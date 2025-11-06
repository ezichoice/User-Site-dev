"use client";

import { supabase } from "@/lib/supabase";
import { useFormik } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";

import { Icon } from "@iconify/react";

export default function ChangePassword() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: ""
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .matches(/[a-z]+/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]+/, "Password must contain at least one uppercase letter")
        .matches(/\d+/, "Password must contain at least one digit")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        const { data, error } = await supabase.auth.updateUser({ password: values.password });

        if (error) {
          toast.error(error.message, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          toast.success("Redirecting to login page.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
        router.push("/auth/login");
      } catch (error) {
        console.error(error);
        toast.error("Error updating new password", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const renderInputField = (
    formikFieldName: string,
    label: string,
    autoComplete: string = 'off',
  ) => {
        
    const value = formik.getFieldProps(formikFieldName).value;
    const touched = formik.getFieldMeta(formikFieldName).touched;
    const error = formik.getFieldMeta(formikFieldName).error;
    
    const inputClasses = `block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 hide-password-toggle ${touched && error ? "ring-red-500": ""}`;
    
    const inputType = showPassword ? 'text': 'password';
        
    return (
      <div className="relative">
        <label htmlFor={formikFieldName} className="block text-sm font-medium leading-6 text-gray-900">
          {label} <span className="text-red-600">*</span>
        </label>
        <div className="">
          <div className="flex items-center justify-end">
            <input
              id={formikFieldName}
              name={formikFieldName}
              type={inputType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={value}
              autoComplete={autoComplete}
              className={`${inputClasses}`}
            />
                
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`px-2 py-1.5 flex items-center text-gray-400 focus:outline-none`}
            >
              {showPassword ? (
                <Icon icon="bi:eye-slash" className="text-2xl"/>
              ): (
                <Icon icon="bi:eye" className="text-2xl" />
              )}
            </button>
          </div>
              
          {touched && error ? (
            <div className="mt-1 text-sm text-red-600">
              {error}
            </div>
          ): null}
              
        </div>
      </div>
    );
  };

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
              Change your password
            </h2>
            
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                {renderInputField("password", "Password", "new-password")}
                {renderInputField("confirmPassword", "Confirm Password", "new-password")}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {formik.isSubmitting ? "Submitting..." : "Update password"}
                </button>
              </div>
            </form>
            
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}
