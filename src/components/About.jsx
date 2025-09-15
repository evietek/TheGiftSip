import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({
  weight: ["600"],
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const AboutSection = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 ml-0 sm:ml-6 2xl:ml-12 relative order-2 lg:order-1">
            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className={`${inter.className} text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-medium text-gray-900 leading-tight`}>
              It’s more than a tee or a mug,<em className="italic"> it’s your story. </em>
              Find the design that tells it perfectly.
              </h1>
            </div>

            {/* Product Link */}
            <Link href="#product" className="flex items-center space-x-2 w-fit">
              <span className={`${poppins.className} text-lg sm:text-xl font-bold text-gray-900 underline`}>
                Product
              </span>
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10 14a1 1 0 01-.707-.293l-5-5a1 1 0 111.414-1.414L10 11.586l4.293-4.293a1 1 0 111.414 1.414l-5 5A1 1 0 0110 14z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>

            {/* Product Images Section */}
            <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto lg:mx-0">
              {/* Green background shape */}
              <div className="absolute bottom-0 right-4 sm:right-6 lg:right-10 w-[200px] sm:w-[240px] lg:w-[280px] h-[300px] sm:h-[360px] lg:h-[420px] bg-[#AFDF6F] rounded-[1.5rem]"></div>
              <Image
                src="/about/zigzag.png"
                alt="Zigzag Pattern"
                width={300}
                height={300}
                className="absolute bottom-0 right-2 sm:right-8 lg:right-13 w-[280px] sm:w-[340px] lg:w-[400px] h-[280px] sm:h-[340px] lg:h-[400px] z-10"
              />
              <Image
                src="/about/mockup-main.png"
                alt="Product Mockup"
                width={350}
                height={450}
                className="rounded-2xl shadow-xl relative z-10 w-[250px] sm:w-[300px] lg:w-[350px] h-auto"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-6 sm:space-y-8 pt-0 sm:pt-8 lg:pt-16 order-1 lg:order-2">
            {/* Top avatars and satisfied customers */}
            <div className="flex flex-col items-center sm:items-end space-y-2 mr-0 sm:mr-8 lg:mr-16">
              <span className={`${poppins.className} text-base sm:text-lg text-purple-600 font-medium text-center sm:text-right`}>
                &gt;100k+ <span className="text-[#12161D]">satisfied customers</span>
              </span>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="w-12 h-12 sm:w-15 sm:h-15 bg-gray-300 rounded-full border-2 border-white overflow-hidden"
                  >
                    <Image
                      src={`/about/person-${n}.png`}
                      alt={`Avatar ${n}`}
                      width={60}
                      height={60}
                      className="rounded-full w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* About us badge */}
            <div className="flex justify-center sm:justify-start mt-8 sm:mt-12 lg:mt-20 -ml-0 sm:-ml-20 lg:-ml-40">
              <span
                className={`${poppins.className} inline-block border border-orange-500 text-orange-500 px-4 sm:px-6 py-2 rounded-full text-sm font-medium`}
              >
                About us
              </span>
            </div>

            {/* Main description */}
            <div className="space-y-4 sm:space-y-6 -ml-0 sm:-ml-20 lg:-ml-40 mr-0 sm:mr-40 lg:mr-80">
              <p className={`${poppins.className} text-xl sm:text-2xl lg:text-3xl text-gray-900 leading-relaxed font-normal text-center sm:text-left`}>
              We believe the best gifts have personality. That's why we pour our creativity into every design, offering unique tees and mugs that spark joy and celebrate the things you love.              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8 lg:space-x-16 -ml-0 sm:-ml-15 lg:-ml-30 pt-6 sm:pt-8 items-center sm:items-start">
              <div className="text-center">
                <h3 className={`${poppins.className} text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900`}>
                  500<span className="text-purple-600">+</span>
                </h3>
                <p className={`${poppins.className} text-gray-700 mt-2 text-sm sm:text-base`}>
                  Original Designs
                </p>
              </div>
              <div className="text-center">
                <h3 className={`${poppins.className} text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900`}>
                  1000<span className="text-purple-600">+</span>
                </h3>
                <p className={`${poppins.className} text-gray-700 mt-2 text-sm sm:text-base`}>
                  Happy Customers
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutSection;