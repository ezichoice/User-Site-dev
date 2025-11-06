"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Course = {
    id: string;
  created_at: string;
  name: string;
  description: string;
  slug: string;
  duration: string;
  enrollment_deadline: string;
  start_date: string;
  end_date: string;
  language: string;
  fee: string;
  discounted_price: string;
  institution_id: string;
  is_active: boolean;
  image_url:string;
  Related_topics: string[];
  sub_title: string;
  Learn: string;
  register_through: string;
};

interface CourseContextType {
  courses: Course[];
  getCourseById: (id: string) => Course | undefined;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("course")
        .select("*, institution(*)")
        .eq("is_active", true);
      
      if (error) {
        console.error("Error fetching courses:", error.message);
      } else {
        setCourses(data as Course[]);
      }
    };

    fetchCourses();
  }, []);

  const getCourseById = (id: string) => {
    return courses.find((course) => String(course.id) === String(id));
  };
  

  return (
    <CourseContext.Provider value={{ courses, getCourseById }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourses must be used within a CourseProvider");
  return context;
};
