import React from "react";
import CourseCard from "../courseCard";
import { useCourses } from "@/context/courseContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function CourseList() {
  const { courses } = useCourses(); // Get courses from context

  const settings = {
    dots: true,
    infinite: courses.length > 4,
    speed: 500,
    slidesToShow: Math.min(4, courses.length),
    slidesToScroll: 1,
    autoplay: courses.length > 4,
    autoplaySpeed: 5000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(3, courses.length) } },
      { breakpoint: 768, settings: { slidesToShow: Math.min(2, courses.length) } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="md:container md:mt-5">
      <div className="relative md:container mx-auto w-11/12 md:w-9/12">
        <h2 className="font-bold py-3 md:mb-5 sm:text-lg md:text-xl">Courses</h2>
        {courses.length > 0 ? (
          <Slider {...settings} className="pb-4 overflow-hidden">
            {courses.map((course) => (
              <div key={course.id} className="p-2">
                <CourseCard course={course} />
              </div>
            ))}
          </Slider>
        ) : (
          <p>No courses available</p>
        )}
      </div>
    </div>
  );
}
