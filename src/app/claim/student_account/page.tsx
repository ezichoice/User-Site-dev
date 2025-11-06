"use client";
import { useState } from "react";

const ClaimStudentAccount = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    university: "",
    studyYear: "",
    universityID: "",
    email: "",
    enrollmentNumber: "",
    department: "",
    dob: "",
    graduationYear: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Submit form data logic here
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-semibold mb-6">Claim Student Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Name */}
        <div>
          <label className="block text-sm font-medium">Student Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Student Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* University */}
        <div>
          <label className="block text-sm font-medium">University</label>
          <input
            type="text"
            name="university"
            value={formData.university}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Studying Year */}
        <div>
          <label className="block text-sm font-medium">Studying Year</label>
          <input
            type="number"
            name="studyYear"
            value={formData.studyYear}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* University ID */}
        <div>
          <label className="block text-sm font-medium">
            University Identity Card Number
          </label>
          <input
            type="text"
            name="universityID"
            value={formData.universityID}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* University Email */}
        <div>
          <label className="block text-sm font-medium">University Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Enrollment Number */}
        <div>
          <label className="block text-sm font-medium">Enrollment Number</label>
          <input
            type="text"
            name="enrollmentNumber"
            value={formData.enrollmentNumber}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Expected Graduation Year */}
        <div>
          <label className="block text-sm font-medium">
            Expected Graduation Year
          </label>
          <input
            type="number"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClaimStudentAccount;
