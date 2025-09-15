"use client";
import React from "react";
import { Inter, Poppins } from "next/font/google";
import Image from "next/image";

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const testimonials = [
  {
    id: 1,
    quote:
      "I struggled to find clothes that fit, but this store changed everything. Their inclusive sizing is amazing!",
    name: "Daniel K",
    role: "Fashion Designer",
    avatar: "/about/person-1.png",
  },
  {
    id: 2,
    quote:
      "I love their collections! Trendy clothes at great prices. I'll shop here again.",
    name: "Carlos H",
    role: "Expert Model",
    avatar: "/about/person-2.png",
  },
];

const TestimonialSection = () => {
  return (
    <section
      className="bg-white py-12 sm:py-12 md:py-16 2xl:py-20 px-4 sm:px-6 md:px-8"
      aria-labelledby="testimonial-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 md:mb-14 2xl:mb-16 space-y-4 sm:space-y-0">
          <h2
            id="testimonial-heading"
            className={`${inter.className} text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-bold text-gray-900 leading-tight text-center sm:text-left`}
          >
            Real Stories, <br />
            Real Smiles
          </h2>

          <a
            href="/reviews"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-colors duration-300 whitespace-nowrap"
          >
            Read All Reviews
          </a>
        </div>

        {/* Background with testimonials */}
        <div className="relative">
          {/* Background image */}
          <div className="relative w-full h-80 sm:h-96 md:h-80 lg:h-80 2xl:h-96 rounded-2xl 2xl:rounded-3xl overflow-hidden">
            <Image
              src="/testimonials/bg.png"
              alt="Decorative background for testimonials"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />

            <Image
              src="/testimonials/zigzag.png"
              alt="Decorative overlay"
              width={1200}
              height={600}
              className="absolute ml-4 mt-4 sm:ml-6 sm:mt-6 md:ml-8 md:mt-8 lg:ml-10 lg:mt-10 2xl:ml-12 2xl:mt-12 w-3/4 sm:w-4/5 md:w-full"
              priority={false}
            />
          </div>

          {/* Testimonial cards */}
          <div className="absolute inset-0 flex items-center justify-center top-20 sm:top-24 md:top-28 lg:top-32 2xl:top-40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
              {testimonials.map((testimonial) => (
                <article
                  key={testimonial.id}
                  className="bg-white rounded-xl 2xl:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg relative"
                >
                  <span
                    aria-hidden="true"
                    className="text-gray-300 text-4xl sm:text-5xl 2xl:text-6xl font-serif sm:mb-3 2xl:mb-4 leading-none block"
                  >
                    "
                  </span>

                  <p
                    className={`${poppins.className} text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed sm:mb-5 2xl:mb-6`}
                  >
                    {testimonial.quote}
                  </p>

                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Image
                      src={testimonial.avatar}
                      alt={`Photo of ${testimonial.name}`}
                      width={50}
                      height={50}
                      className="rounded-full object-cover w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 2xl:w-[50px] 2xl:h-[50px]"
                    />
                    <div>
                      <h3
                        className={`${inter.className} font-semibold text-gray-900 text-sm sm:text-base`}
                      >
                        {testimonial.name}
                      </h3>
                      <p
                        className={`${poppins.className} text-gray-500 text-xs sm:text-sm`}
                      >
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
