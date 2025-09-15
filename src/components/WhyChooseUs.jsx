"use client";
import React from "react";
import { Inter, Poppins } from "next/font/google";
import Image from "next/image";

const inter = Inter({
  weight: ["600"],
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const features = [
  {
    icon: "/whychooseus/curated.png",
    title: "Unique, Original Designs",
    description: "You won't find our witty and wonderful designs anywhere else. Every graphic is created by our team to help you tell your story.",
    


  },
  {
    icon: "/whychooseus/inclusive.png",
    title: "Unique, Original Designs",
    description: "You won't find our witty and wonderful designs anywhere else. Every graphic is created by our team to help you tell your story.",
    


  },
  {
    icon: "/whychooseus/luxury.png",
    title: "Feel-Good Quality",
    description: "Our tees are incredibly soft and durable, and our mugs feature vibrant, dishwasher-safe prints that last. We make gifts designed to be loved for years.",
    


  },
];

const WhyChooseUs = () => {
  return (
    <div className="bg-white py-16 px-8 relative">
      <div className="max-w-7xl mx-auto">

        {/* Responsive top heading */}
        <div className="mb-16 flex flex-col items-center">
          <div className="flex items-center w-full">
            <h2 className={`${inter.className} 2xl:text-8xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-3xl font-semibold text-gray-900 whitespace-nowrap`}>
              Life isn't perfect,
            </h2>
            <span className="hidden md:block flex-1 h-px bg-gray-300 2xl:ml-16 xl:ml-12 lg:ml-8 ml-4"></span>
          </div>
          <div className="flex items-center w-full 2xl:mt-2 xl:mt-1 lg:mt-1 md:mt-0 mt-0">
            <span className="hidden md:block 2xl:w-100 xl:w-80 lg:w-64 md:w-48 w-32 h-px bg-gray-300 2xl:mr-16 xl:mr-12 lg:mr-8 mr-4 2xl:-mt-20 xl:-mt-16 lg:-mt-12 md:-mt-8 -mt-4"></span>
            <p className={`${inter.className} italic 2xl:text-8xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-3xl text-gray-900`}>
              but your style, tee or mug, can be.
            </p>
          </div>
        </div>

        <h2 className={`${inter.className} 2xl:text-4xl xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl text-lg font-semibold text-gray-900 mb-12`}>
        The Gift Sip Promise
        </h2>

        {/* Desktop and tablet layout */}
        <div className="hidden lg:block">
          <div className="relative flex justify-start lg:justify-start">
            {/* Central Image */}
            <div className="relative">
              <Image
                src="/whychooseus/why-choose-us.png"
                alt="Why Choose Us"
                width={500}
                height={500}
                className="rounded-2xl object-cover 2xl:w-[500px] 2xl:h-[500px] xl:w-[400px] xl:h-[400px] lg:w-[350px] lg:h-[350px]"
              />

              {/* Arrows */}
              <div className="absolute 2xl:right-[-60px] xl:right-[-50px] lg:right-[-40px] top-0 flex flex-col space-y-2">
                <button className="2xl:w-8 2xl:h-8 xl:w-7 xl:h-7 lg:w-6 lg:h-6 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition">
                  <svg className="2xl:w-4 2xl:h-4 xl:w-3.5 xl:h-3.5 lg:w-3 lg:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button className="2xl:w-8 2xl:h-8 xl:w-7 xl:h-7 lg:w-6 lg:h-6 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition">
                  <svg className="2xl:w-4 2xl:h-4 xl:w-3.5 xl:h-3.5 lg:w-3 lg:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Feature 1 - Curated Styles (Top Right) */}
            <div className="absolute top-0 2xl:right-[160px] xl:right-[120px] lg:right-[100px] 2xl:w-120 xl:w-100 lg:w-80">
              <div className="flex items-start space-x-4">
                <div className="2xl:w-12 2xl:h-12 xl:w-10 xl:h-10 lg:w-8 lg:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={features[0].icon}
                    alt={features[0].title}
                    width={40}
                    height={40}
                    className="2xl:w-10 2xl:h-10 xl:w-8 xl:h-8 lg:w-6 lg:h-6"
                  />
                </div>
                <div>
                  <h4 className={`${poppins.className} font-semibold text-gray-900 mb-2 2xl:text-xl xl:text-lg lg:text-base`}>
                    {features[0].title}
                  </h4>
                  <p className={`${poppins.className} text-gray-600 2xl:text-base xl:text-sm lg:text-xs leading-relaxed`}>
                    {features[0].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 - Inclusive Fashion (Right Middle) */}
            <div className="absolute top-1/3 2xl:right-[80px] xl:right-[60px] lg:right-[40px] 2xl:w-120 xl:w-100 lg:w-80">
              <div className="flex items-start space-x-4">
                <div className="2xl:w-12 2xl:h-12 xl:w-10 xl:h-10 lg:w-8 lg:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={features[1].icon}
                    alt={features[1].title}
                    width={40}
                    height={40}
                    className="2xl:w-10 2xl:h-10 xl:w-8 xl:h-8 lg:w-6 lg:h-6"
                  />
                </div>
                <div>
                  <h4 className={`${poppins.className} font-semibold text-gray-900 mb-2 2xl:text-xl xl:text-lg lg:text-base`}>
                    {features[1].title}
                  </h4>
                  <p className={`${poppins.className} text-gray-600 2xl:text-base xl:text-sm lg:text-xs leading-relaxed`}>
                    {features[1].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 - Affordable Luxury (Bottom Right) */}
            <div className="absolute xl:top-80 lg:top-72 2xl:right-[160px] xl:right-[120px] lg:right-[100px] 2xl:w-120 xl:w-100 lg:w-80">
              <div className="flex items-start space-x-4">
                <div className="2xl:w-12 2xl:h-12 xl:w-10 xl:h-10 lg:w-8 lg:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={features[2].icon}
                    alt={features[2].title}
                    width={40}
                    height={40}
                    className="2xl:w-10 2xl:h-10 xl:w-8 xl:h-8 lg:w-6 lg:h-6"
                  />
                </div>
                <div>
                  <h4 className={`${poppins.className} font-semibold text-gray-900 mb-2 2xl:text-xl xl:text-lg lg:text-base`}>
                    {features[2].title}
                  </h4>
                  <p className={`${poppins.className} text-gray-600 2xl:text-base xl:text-sm lg:text-xs leading-relaxed`}>
                    {features[2].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile and tablet version - clean stacked layout */}
        <div className="lg:hidden">
          {/* Mobile image */}
          <div className="flex justify-center mb-8">
            <Image
              src="/whychooseus/why-choose-us.png"
              alt="Why Choose Us"
              width={300}
              height={300}
              className="rounded-2xl object-cover md:w-[350px] md:h-[350px] sm:w-[280px] sm:h-[280px] w-[250px] h-[250px]"
            />
          </div>

          {/* Mobile features */}
          <div className="flex flex-col space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="md:w-12 md:h-12 sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={24}
                    height={24}
                    className="md:w-6 md:h-6 sm:w-5 sm:h-5 w-4 h-4"
                  />
                </div>
                <div>
                  <h4 className={`${poppins.className} font-semibold text-gray-900 mb-2 md:text-lg sm:text-base text-sm`}>
                    {feature.title}
                  </h4>
                  <p className={`${poppins.className} text-gray-600 md:text-sm sm:text-xs text-xs leading-relaxed`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;