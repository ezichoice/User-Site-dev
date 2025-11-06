"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "@/utils";

export interface Course {
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
}

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/course/${course.id}`); // Navigate to specific course page
  };

  return (
    <div
      onClick={handleClick}
      className="max-w-sm bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative h-48 w-full">
        <Image
          src={course.image_url}
          alt={course.name}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-l font-bold">{course.name}</h2>
        <p className="text-gray-600 text-xs mb-1">{course.description}</p>

        <div className="mb-1">
          <span className="text-sm font-extrabold text-blue-600">
            {course.duration}
          </span>
        </div>

        <div className="text-gray-700 text-sm space-y-2">
          <p>
            <span className="font-semibold">Start Date:</span> {course.start_date}
          </p>
          <p className="flex items-center">
            <span className="font-semibold">Apply before:</span>
            <span className="ml-1">{course.enrollment_deadline}</span>
          </p>
          <p>
            <span className="font-semibold">Language:</span> {course.language}
          </p>
          <p>
           {parseInt(course.fee)!=0 && <span className="line-through text-red-500">
              {formatCurrency(parseInt(course.fee))}
            </span>}
           {parseInt(course.discounted_price)!=0? <span className="ml-2 text-green-600 font-bold">
              {formatCurrency(parseInt(course.discounted_price))}
            </span>:<span className="ml-2 text-green-600 font-bold">
             Free
            </span> }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
