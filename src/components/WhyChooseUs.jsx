"use client";
import React, { useState } from "react";
import { Inter, Poppins } from "next/font/google";
import Image from "next/image";

const inter = Inter({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const features = [
  {
    icon: "/whychooseus/curated.png",
    title: "Unique, Original Designs",
    description:
      "You won't find our witty and wonderful designs anywhere else. Every graphic is created by our team to help you tell your story.",
    image: "/whychooseus/why-choose-us.png",
  },
  {
    icon: "/whychooseus/inclusive.png",
    title: "Inclusive Fashion",
    description:
      "Our styles are made for everyone, embracing diversity and celebrating individuality in every piece we design.",
    image: "/whychooseus/why-choose-us-2.png",
  },
  {
    icon: "/whychooseus/luxury.png",
    title: "Feel-Good Quality",
    description:
      "Our tees are incredibly soft and durable, and our mugs feature vibrant, dishwasher-safe prints that last. We make gifts designed to be loved for years.",
    image: "/whychooseus/why-choose-us-3.png",
  },
];

const WhyChooseUs = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      className="bg-white py-16 px-8 relative"
      aria-labelledby="why-choose-us-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top heading */}
        <div className="mb-16 flex flex-col items-center">
          <div className="flex items-center w-full">
            <h2
              id="why-choose-us-heading"
              className={`${inter.className} 2xl:text-8xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-3xl font-semibold text-gray-900 whitespace-nowrap`}
            >
              Life isn't perfect,
            </h2>
            <span
              aria-hidden="true"
              className="hidden md:block flex-1 h-px bg-gray-300 2xl:ml-16 xl:ml-12 lg:ml-8 ml-4"
            />
          </div>
          <div className="flex items-center w-full 2xl:mt-2 xl:mt-1 lg:mt-1 md:mt-0">
            <span
              aria-hidden="true"
              className="hidden md:block 2xl:w-100 xl:w-80 lg:w-64 md:w-48 w-32 h-px bg-gray-300 2xl:mr-16 xl:mr-12 lg:mr-8 mr-4 2xl:-mt-20 xl:-mt-16 lg:-mt-12 md:-mt-8 -mt-4"
            />
            <p
              className={`${inter.className} italic 2xl:text-8xl xl:text-7xl lg:text-6xl md:text-5xl sm:text-4xl text-3xl text-gray-900`}
            >
              but your style, tee or mug, can be.
            </p>
          </div>
        </div>

        <h3
          className={`${inter.className} 2xl:text-4xl xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl text-lg font-semibold text-gray-900 mb-12`}
        >
          The Gift Sip Promise
        </h3>

        {/* Desktop */}
        <div className="hidden lg:block">
          <div className="relative flex justify-start lg:justify-start">
            {/* Central Image */}
            <div className="relative">
              <Image
                src={features[activeIndex].image}
                alt="Illustration showing Gift Sip brand values"
                width={500}
                height={500}
                priority
                className="rounded-2xl object-cover 2xl:w-[500px] 2xl:h-[500px] xl:w-[400px] xl:h-[400px] lg:w-[350px] lg:h-[350px]"
              />

              {/* Arrows */}
              <div className="absolute 2xl:right-[-60px] xl:right-[-50px] lg:right-[-40px] top-0 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Scroll features up"
                  className="2xl:w-8 2xl:h-8 xl:w-7 xl:h-7 lg:w-6 lg:h-6 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition"
                >
                  <svg
                    className="2xl:w-4 2xl:h-4 xl:w-3.5 xl:h-3.5 lg:w-3 lg:h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Scroll features down"
                  className="2xl:w-8 2xl:h-8 xl:w-7 xl:h-7 lg:w-6 lg:h-6 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition"
                >
                  <svg
                    className="2xl:w-4 2xl:h-4 xl:w-3.5 xl:h-3.5 lg:w-3 lg:h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Features */}
            <ul className="list-none m-0 p-0">
              {features.map((feature, i) => (
                <li
                  key={i}
                  className={`absolute ${
                    i === 0
                      ? "top-0 2xl:right-[160px] xl:right-[120px] lg:right-[100px]"
                      : i === 1
                      ? "top-1/3 2xl:right-[80px] xl:right-[60px] lg:right-[40px]"
                      : "xl:top-80 lg:top-72 2xl:right-[160px] xl:right-[120px] lg:right-[100px]"
                  } 2xl:w-120 xl:w-100 lg:w-80`}
                >
                  <div
                    className={`flex items-start space-x-4 p-4 rounded-xl transition ${
                      activeIndex === i
                        ? "bg-gray-100 shadow-md"
                        : "bg-transparent"
                    }`}
                  >
                    <div className="2xl:w-12 2xl:h-12 xl:w-10 xl:h-10 lg:w-8 lg:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={feature.icon}
                        alt=""
                        width={40}
                        height={40}
                        className="2xl:w-10 2xl:h-10 xl:w-8 xl:h-8 lg:w-6 lg:h-6"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <h4
                        className={`${poppins.className} font-semibold text-gray-900 mb-2 2xl:text-xl xl:text-lg lg:text-base`}
                      >
                        {feature.title}
                      </h4>
                      <p
                        className={`${poppins.className} text-gray-600 2xl:text-base xl:text-sm lg:text-xs leading-relaxed`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile layout (unchanged) */}
        <div className="lg:hidden">
          <div className="flex justify-center mb-8">
            <Image
              src={features[activeIndex].image}
              alt="Illustration showing Gift Sip promise"
              width={300}
              height={300}
              className="rounded-2xl object-cover md:w-[350px] md:h-[350px] sm:w-[280px] sm:h-[280px] w-[250px] h-[250px]"
            />
          </div>
          <ul className="flex flex-col space-y-6">
            {features.map((feature, index) => (
              <li
                key={index}
                className={`flex items-start space-x-4 rounded-lg border p-6 transition ${
                  activeIndex === index
                    ? "bg-gray-100 border-gray-200 shadow-md"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="md:w-12 md:h-12 sm:w-10 sm:h-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={24}
                    height={24}
                    className="md:w-6 md:h-6 sm:w-5 sm:h-5 w-4 h-4"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h4
                    className={`${poppins.className} font-semibold text-gray-900 mb-2 md:text-lg sm:text-base text-sm`}
                  >
                    {feature.title}
                  </h4>
                  <p
                    className={`${poppins.className} text-gray-600 md:text-sm sm:text-xs text-xs leading-relaxed`}
                  >
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
