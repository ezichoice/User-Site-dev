"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/utils";
import { useCourses } from "@/context/courseContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { courseRegistration } from "../../api/register";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';


const CoursePage = ({ params }: { params: { courseId: string } }) => {
  const { courseId } = params;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", course_id:courseId,course_name:"",phone:"" });
  const { getCourseById , courses } = useCourses();
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);



  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Name is too short")
      .max(50, "Name is too long")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
      phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\d{11}$/, "Phone number must be exactly 10 digits"),

  });

  

  useEffect(() => {
    const selectedCourse = getCourseById(courseId);
    if (selectedCourse) {
      setCourse(selectedCourse);
      setLoading(false);
    }
  }, [courseId, getCourseById]);


  // const hardcodedData = {
  //   subtitle: "Master the essentials of tourism and hospitality management",
  //   instructorRating: 4.8,
  //   totalRatings: 2534,
  //   totalStudents: 15000,
  //   image:
  //     "https://sche-edu-lk.b-cdn.net/wp-content/uploads/2023/09/DIPLOMA-IN-TOURISM-HOTEL-MANAGEMENT.jpg",
  //   whatYouWillLearn: [
  //     "Front desk and reception operations",
  //     "Fundamentals of tourism and hospitality marketing",
  //     "Customer service best practices",
  //     "Hotel and restaurant management essentials",
  //     "Event planning and coordination",
  //     "Food and beverage operations",
  //   ],
  //   relatedTopics: ["Hospitality", "Tourism", "Hotel Management", "Event Management", "Food & Beverage"],
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("User registration data:", formData);
    alert("Registration successful!");
    setFormData({ name: "", email: "" , course_id:courseId,course_name:"",phone:"" });
    setIsModalOpen(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!course) return <p>Course not found</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.name}</h1>
      <p className="text-lg text-gray-600 mb-2">{course.sub_title}</p>
      <p className="text-sm text-gray-500">
  Offered by{" "}
  <Link
    href={`/Institute/${course.institution_id}`} 
    className="font-medium text-gray-700 hover:underline"
  >
    {course.institution?.name}
  </Link>
</p>
  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">What you will learn</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {course.Learn.split(',').map((item:String, index:number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Explore related topics</h2>
          <div className="flex flex-wrap gap-2">
            {course. Related_topics.map((topic:String, index:number) => (
              <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{topic}</span>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <img src={course.image_url} alt="Course cover" className="w-full h-48 object-cover rounded-md" />
          <p
  className={`text-2xl font-semibold mt-4 ${
    parseInt(course.discounted_price) !== 0 ? "text-gray-800" : "text-green-600"
  }`}
>
  {parseInt(course.discounted_price) !== 0
    ? formatCurrency(parseInt(course.discounted_price))
    : "Free"}</p>
          <button onClick={() =>course.register_through=="ezichoice"? setIsModalOpen(true):window.open(course.register_through, "_blank")} className="bg-purple-600 text-white w-full py-2 rounded-md mt-2 hover:bg-purple-700 transition-colors">Register</button>
          <p className="text-sm text-gray-500 mt-2">30-Day Money-Back Guarantee</p>
          <hr className="my-4" />
          <p className="text-sm text-gray-500">Language: {course.language}</p>
          <p className="text-sm text-gray-500">Apply Before: {course.enrollment_deadline}</p>
          <p className="text-sm text-gray-500">Course starting on: {course.start_date}</p>
        </div>
      </div>

      {isModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Register for {course.name}
      </h2>

      <Formik
        initialValues={{ name: "", email: "" ,course_id:courseId,course_name:"",phone:"" }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            values= { ...values, course_name: course.name, phone: values.phone.startsWith('+') ? values.phone : `+${values.phone}`};
            console.log("User registration data:", values);
            const insertCourseData=await courseRegistration(values);
            if(insertCourseData){
              setToast({ type: "success", message: "Registration successful!" });
            }
            else{
              setToast({ type: "error", message: "Registration failed. Try again!" });
            }
           
            resetForm();
            setIsModalOpen(false);
          } catch (err) {
            setToast({ type: "error", message: "Registration failed. Try again!" });
          }
        
          // Hide toast after 3 seconds
          setTimeout(() => setToast(null), 3000);
        
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Field
                type="text"
                name="name"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Field
                type="email"
                name="email"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <Field name="phone">
  {({ field, form }: { field: any; form: any }) => (
    <div>
      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
        Phone Number
      </label>
      <PhoneInput
        country={'lk'} // default country (Sri Lanka)
        value={field.value}
        onChange={(phone) => form.setFieldValue("phone", phone)}
        enableSearch={true}
        disableDropdown={false}
        dropdownStyle={{ maxHeight: "200px", overflowY: "auto" }}

        // Important style fixes:
        containerClass="!w-full"
        inputStyle={{
          width: '100%',
          height: '40px',
          paddingLeft: '48px', // space for flag
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db' // gray-300
        }}
        buttonStyle={{
          border: 'none',
          background: 'none'
        }}
      />
      <ErrorMessage
        name="phone"
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  )}
</Field>



            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  </div>
)}


{toast && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
    <div
      className={`bg-white shadow-2xl rounded-xl px-10 py-6 flex items-center space-x-5 border-t-8 transition-all duration-300
        ${toast.type === "success" ? "border-green-500" : "border-red-500"}`}
    >
      <div className="text-5xl">
        {toast.type === "success" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <div className="text-gray-800 text-lg font-semibold">{toast.message}</div>
    </div>
  </div>
)}



    </div>
  );
};

export default CoursePage;
