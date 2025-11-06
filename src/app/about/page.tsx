import React from "react";
import Head from "next/head";

export default function About() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        {/* About Us Section */}
        <section className="w-full md:w-11/12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20 rounded-b-3xl shadow-lg">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              About Us
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              At Dynamic Company, we are at the forefront of innovative
              branding, marketing, and business solutions that push the
              boundaries of excellence.
            </p>
          </div>
        </section>

        {/* Our Own Words Section */}
        {/* <section className="w-full md:w-11/12 py-20 text-gray-800">
          <div className="container mx-auto px-6 md:flex md:items-center md:justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-extrabold mb-6">In Our Own Words</h2>
              <p className="text-lg leading-relaxed mb-6">
                We offer a wide range of innovative business-improving solutions
                in addition to custom branding and marketing strategies. Our
                expertise lies in crafting standout events, seamless gift
                exchanges, and personalized offers that enhance client
                engagement. From special product promotions to corporate event
                planning, Ezichoice is dedicated to delivering tailored
                solutions that lead to success.
              </p>
              <a
                href="#"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition duration-300"
              >
                Learn More
              </a>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <img
                src="./aboutUs/img1.jpg"
                alt="Our Words Illustration"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </section> */}

        {/* Our Values Section */}
        <section className="w-full md:w-11/12 py-20 bg-gradient-to-r from-blue-100 to-indigo-200 text-gray-800">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Dedication */}
              <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src="./aboutUs/icon1.png"
                  alt="Dedication Icon"
                  className="w-20 h-20 mx-auto mb-6"
                />
                <h3 className="text-2xl font-bold mb-4">Dedication</h3>
                <p className="text-lg">
                  At Ezichoice, innovation, excellence, and client satisfaction
                  drive everything we do.
                </p>
              </div>

              {/* Aim */}
              <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src="./aboutUs/icon2.png"
                  alt="Aim Icon"
                  className="w-20 h-20 mx-auto mb-6"
                />
                <h3 className="text-2xl font-bold mb-4">Aim</h3>
                <p className="text-lg">
                  We empower businesses with the tools to elevate their products
                  and services locally and globally.
                </p>
              </div>

              {/* Goal */}
              <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src="./aboutUs/icon3.png"
                  alt="Goal Icon"
                  className="w-20 h-20 mx-auto mb-6"
                />
                <h3 className="text-2xl font-bold mb-4">Goal</h3>
                <p className="text-lg">
                  Our goal is to become a leader in the field, recognized for
                  integrity, creativity, and outstanding results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="w-full md:w-11/12 py-20 text-gray-800">
          <div className="container mx-auto px-6 md:flex md:items-center md:justify-between gap-12">
            <div className="md:w-1/2 order-2 md:order-1 mt-12 md:mt-0">
              <img
                src="./aboutUs/ourvision.jpg"
                alt="Vision illustration"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <h2 className="text-4xl font-extrabold mb-6">Our Vision</h2>
              <p className="text-lg leading-relaxed mb-6">
                To be the trusted platform for the best deals, making shopping
                simple, fun, and rewarding for everyone.
              </p>
              {/* <a
                href="#"
                className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300"
              >
                Our Projects
              </a> */}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="w-full md:w-11/12 py-20 bg-white text-gray-800">
          <div className="container mx-auto px-6 md:flex md:items-center md:justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-extrabold mb-6">Our Mission</h2>
              <p className="text-lg leading-relaxed mb-6">
                To bring unbeatable offers, clear service, and quality products
                to save customers time and money with an easy shopping
                experience.
              </p>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition duration-300"
              >
                Contact Us
              </a>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <img
                src="./aboutUs/ourmission.jpeg"
                alt="Mission illustration"
                className="w-full rounded-lg shadow-2xl h-96 object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
