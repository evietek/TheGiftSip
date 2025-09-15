"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiArrowUpRight, FiSearch } from "react-icons/fi";
import { Luckiest_Guy, Poppins } from "next/font/google";

// Load the Luckiest Guy font at 400 weight for headings
const luckiest = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
});

// Load Poppins for description
const poppins = Poppins({
  weight: ["400", "500"],
  subsets: ["latin"],
});

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden relative py-30">
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="relative max-w-md space-y-8 2xl:ml-24 lg:ml-12 ml-0">
            {/* Decorative arrow */}
            <FiArrowUpRight
              className="absolute 2xl:top-54 lg:top-40 top-32 left-0 2xl:text-3xl lg:text-2xl text-xl text-[#12161D]"
              aria-hidden="true"
            />

            {/* Heading */}
            <h1
              className={`${luckiest.className} 2xl:text-[96px] xl:text-[72px] lg:text-[64px] md:text-[56px] sm:text-[48px] text-[40px] text-[#12161D] leading-none`}
              aria-label="Style, Fashion, Trend"
            >
              STYLE<span className="text-[#8A38EE]">/</span>
              <br />
              <span className="text-[#8A38EE] 2xl:ml-24 xl:ml-18 lg:ml-16 md:ml-14 sm:ml-12 ml-10">
                /
              </span>
              <span className="italic text-[#12161D]">FASHION</span>
              <br />
              TREND<span className="text-[#8A38EE]">/</span>
            </h1>

            {/* Subtitle */}
            <p
              className={`${poppins.className} text-gray-600 2xl:text-lg xl:text-base lg:text-base md:text-base sm:text-sm text-sm max-w-md leading-relaxed 2xl:ml-16 lg:ml-12 ml-0`}
            >
              Wear your vibe, sip your story.
              <br />
              Discover unique graphic tees and funny mugs designed for memorable
              sips and daily smiles.
            </p>

            {/* Search field */}
            <form
              onSubmit={handleSearch}
              className="flex items-center mt-6 w-full max-w-md rounded-full overflow-hidden border border-gray-300 bg-white shadow-sm 2xl:ml-16 lg:ml-12 ml-0 focus-within:ring-2 focus-within:ring-orange-500"
            >
              <label htmlFor="hero-search" className="sr-only">
                Search products
              </label>

              <button
                type="submit"
                className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium 2xl:px-5 lg:px-4 px-3 2xl:py-3 lg:py-2.5 py-2 rounded-full whitespace-nowrap 2xl:text-base lg:text-sm text-xs hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
              >
                Find Your Style
                <span className="ml-2 flex items-center justify-center 2xl:w-6 2xl:h-6 lg:w-5 lg:h-5 w-4 h-4 border border-white rounded-full">
                  <FiSearch
                    className="text-white 2xl:text-sm lg:text-xs text-xs"
                    aria-hidden="true"
                  />
                </span>
              </button>

              <input
                id="hero-search"
                type="text"
                placeholder="ex. Mug"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 2xl:py-3 lg:py-2.5 py-2 2xl:px-4 lg:px-3 px-2 placeholder-gray-400 text-gray-900 focus:outline-none 2xl:text-base lg:text-sm text-xs"
              />
            </form>
          </div>

          {/* Right Content */}
          <div className="relative 2xl:h-[500px] xl:h-[450px] lg:h-[400px] md:h-[350px] sm:h-[300px] h-[250px] order-first lg:order-last">
            {/* Zigzag background (decorative) */}
            <div className="absolute top-0 2xl:left-30 xl:left-24 lg:left-20 md:left-16 sm:left-12 left-8 2xl:w-225 xl:w-180 lg:w-160 md:w-140 sm:w-120 w-100 2xl:h-225 xl:h-180 lg:h-160 md:h-140 sm:h-120 h-100 transform -translate-x-1/4 -translate-y-1/4 z-0">
              <Image
                src="/hero/zigzag.svg"
                alt="Zigzag decorative background"
                role="presentation"
                fill
                className="object-contain"
              />
            </div>

            {/* Main Mug Image */}
            <div className="absolute 2xl:w-280 xl:w-224 lg:w-200 md:w-180 sm:w-160 w-140 2xl:h-280 xl:h-224 lg:h-200 md:h-180 sm:h-160 h-140 2xl:-top-38 xl:-top-30 lg:-top-24 md:-top-20 sm:-top-16 -top-12 2xl:-left-75 xl:-left-60 lg:-left-50 md:-left-40 sm:-left-32 -left-24">
              <Image
                src="/hero/hero-mug.png"
                alt="Hero mug product"
                fill
                className="object-contain"
              />
            </div>

            {/* T-Shirt Widget */}
            <div className="absolute 2xl:top-14 xl:top-12 lg:top-10 md:top-8 sm:top-6 top-4 2xl:right-28 xl:right-22 lg:right-18 md:right-14 sm:right-10 right-6 2xl:w-50 xl:w-40 lg:w-36 md:w-32 sm:w-28 w-24 2xl:h-70 xl:h-56 lg:h-50 md:h-44 sm:h-40 h-36">
              <Image
                src="/hero/tshirt-widget.png"
                alt="T-shirt widget product preview"
                fill
                className="object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Review Widget (decorative preview) */}
            <div className="absolute 2xl:bottom-8 xl:bottom-6 lg:bottom-4 md:bottom-2 sm:bottom-0 bottom-0 2xl:left-35 xl:left-28 lg:left-24 md:left-20 sm:left-16 left-12 transform -translate-x-1/2 2xl:w-90 xl:w-72 lg:w-64 md:w-56 sm:w-48 w-40 2xl:h-35 xl:h-28 lg:h-25 md:h-22 sm:h-20 h-18">
              <Image
                src="/hero/review-widget.png"
                alt="rating and review widget preview"
                role="presentation"
                fill
                className="object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Small Detail Mug */}
            <div className="absolute 2xl:-bottom-40 xl:-bottom-32 lg:-bottom-28 md:-bottom-24 sm:-bottom-20 -bottom-16 2xl:right-56 xl:right-44 lg:right-36 md:right-28 sm:right-20 right-12 2xl:w-36 xl:w-28 lg:w-24 md:w-20 sm:w-16 w-12 2xl:h-36 xl:h-28 lg:h-24 md:h-20 sm:h-16 h-12">
              <Image
                src="/hero/detail-mug.png"
                alt="Detail mug product preview"
                fill
                className="object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
