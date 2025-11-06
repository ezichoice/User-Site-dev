"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import CourseCard from "@/components/courseCard";

interface Institution {
  id: string;
  name: string;
  description: string;
  logo: string;
  cover_image: string;
  website: string;
  email: string;
  phone: string;
}

const InstitutePage = ({ params }: { params: { InstituteId: string } }) => {
  const { InstituteId } = params;
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutionData = async () => {
      setLoading(true);
      try {
        // Fetch institution data
        const { data: institutionData, error: institutionError } = await supabase
          .from("institution")
          .select("id, name, description, logo, cover_image, website, email, phone")
          .eq("id", InstituteId)
          .single();

        if (institutionError) throw institutionError;

        setInstitution(institutionData);

        // Fetch courses for the institution
        const { data: courseData, error: courseError } = await supabase
          .from("course")
          .select("*")
          .eq("institution_id", InstituteId)
          .eq("is_active", true);

        if (courseError) throw courseError;

        setCourses(courseData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutionData();
  }, [InstituteId]);

  if (loading) return <div>Loading...</div>;
  if (!institution) return <div>Institution not found</div>;

  return (
    <div className="container mx-auto px-4 pt-12">
      {/* Cover Image */}
      <div className="relative w-full h-64">
        <Image
          src={institution.cover_image || "/default-cover.jpg"}
          alt={`${institution.name} Cover`}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      {/* Logo and Institute Info */}
      <div className="text-center mt-8">
        <a
          href={institution.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          title={`Visit ${institution.name} website`}
        >
          <div className="relative mx-auto w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
            <Image
              src={institution.logo || "/default-logo.png"}
              alt={`${institution.name} Logo`}
              layout="fill"
              objectFit="cover"
            />
          </div>
        </a>
        <a
          href={institution.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h1 className="text-3xl font-bold mt-4 hover:underline">
            {institution.name}
          </h1>
        </a>
        <p className="text-gray-600 mt-2">{institution.description}</p>
      </div>

      {/* Courses Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Courses</h2>
        {courses.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 coursesContainer"
          >
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p>No courses available for this institution.</p>
        )}
      </div>
    </div>
  );
};

export default InstitutePage;
