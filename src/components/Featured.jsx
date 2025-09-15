"use client";
import React, { useRef, useState, useEffect } from "react";
import { Inter, Poppins } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({
  weight: ["600"],
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const FeaturedSection = () => {
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/printify/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          const limitedProducts = data.slice(0, 6).map((product) => ({
            id: product.id,
            title: product.name,
            price: Number(product.price).toFixed(2),
            img: product.image,
          }));
          setFeaturedProducts(limitedProducts);
        }
      } catch {
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Scroll handler
  const handleScroll = (dir) => {
    if (scrollRef.current) {
      const getScrollDistance = () => {
        if (window.innerWidth >= 1536) return 336;
        if (window.innerWidth >= 1280) return 288;
        if (window.innerWidth >= 1024) return 248;
        if (window.innerWidth >= 768) return 208;
        return 176;
      };

      scrollRef.current.scrollBy({
        left: dir === "left" ? -getScrollDistance() : getScrollDistance(),
        behavior: "smooth",
      });
    }
  };

  // Progress indicator
  const updateScrollProgress = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress =
        maxScroll > 0 ? Math.min((scrollLeft / maxScroll) * 100, 100) : 0;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement && !loading) {
      scrollElement.addEventListener("scroll", updateScrollProgress);
      updateScrollProgress();
      return () =>
        scrollElement.removeEventListener("scroll", updateScrollProgress);
    }
  }, [loading, featuredProducts]);

  return (
    <section
      className="relative bg-white overflow-visible 2xl:py-16 xl:py-14 lg:py-12 md:py-10 py-8 2xl:px-8 xl:px-6 lg:px-4 px-2"
      aria-labelledby="featured-heading"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="2xl:mb-8 xl:mb-7 lg:mb-6 md:mb-5 mb-4">
          <div className="flex lg:flex-row flex-col lg:justify-between lg:items-start items-center 2xl:mb-6 xl:mb-5 lg:mb-4 md:mb-4 mb-3">
            <h3
              id="featured-heading"
              className={`${inter.className} 2xl:text-3xl xl:text-2xl lg:text-xl md:text-lg sm:text-base text-sm font-semibold text-gray-900 leading-tight lg:text-left text-center`}
            >
              The Fan Favorites <br />
              Collection.
            </h3>

            <div className="flex flex-col space-y-2 2xl:max-w-xs xl:max-w-sm lg:max-w-xs md:max-w-sm max-w-full">
              <span
                className={`${poppins.className} lg:self-start self-center inline-block border border-orange-500 text-orange-500 2xl:px-3 2xl:py-0.5 xl:px-2.5 xl:py-0.5 lg:px-2 lg:py-0.5 md:px-2 md:py-0.5 px-2 py-0.5 rounded-full 2xl:text-lg xl:text-base lg:text-sm md:text-sm sm:text-xs text-xs font-medium whitespace-nowrap`}
              >
                🔥 Trending
              </span>
              <p
                className={`${poppins.className} text-gray-500 2xl:text-base xl:text-sm lg:text-xs md:text-xs sm:text-xs text-xs lg:text-left text-center leading-relaxed`}
              >
                From viral hits to timeless classics, <br />
                these are the tees and mugs making everyone smile.
              </p>
            </div>
          </div>

          {/* Progress indicator with arrows */}
          <div className="flex items-center 2xl:space-x-4 xl:space-x-3 lg:space-x-2 space-x-2">
            <div className="flex-1 h-0.5 bg-gray-300 relative" aria-hidden>
              <div
                className="absolute left-0 top-0 h-0.5 bg-gray-900 transition-all duration-300"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                aria-label="Scroll left"
                className="2xl:w-8 2xl:h-8 xl:w-7 xl:h-7 lg:w-6 lg:h-6 md:w-6 md:h-6 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
              >
                <svg
                  className="2xl:w-4 2xl:h-4 xl:w-3.5 xl:h-3.5 lg:w-3 lg:h-3 md:w-3 md:h-3 w-2.5 h-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                aria-label="Scroll right"
                className="2xl:w-8 2xl:h-8 xl:w-7 xl:h-7 lg:w-6 lg:h-6 md:w-6 md:h-6 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
              >
                <svg
                  className="2xl:w-4 2xl:h-4 xl:w-3.5 xl:h-3.5 lg:w-3 lg:h-3 md:w-3 md:h-3 w-2.5 h-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Products Container */}
        <div className="relative">
          {loading ? (
            <div
              className="flex overflow-x-auto 2xl:space-x-4 xl:space-x-3 lg:space-x-2 space-x-2 2xl:px-12 xl:px-8 lg:px-6 md:px-4 px-2 2xl:pb-26 xl:pb-20 lg:pb-16 md:pb-12 pb-8"
              role="status"
              aria-label="Loading featured products"
            >
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-white rounded-2xl shadow-lg 2xl:p-6 xl:p-5 lg:p-4 md:p-3 p-3 2xl:w-72 xl:w-64 lg:w-56 md:w-48 w-40 animate-pulse"
                  aria-hidden="true"
                >
                  <div className="w-full 2xl:h-72 xl:h-56 lg:h-48 md:h-40 h-32 rounded-xl bg-gray-200 2xl:mb-4 xl:mb-3 lg:mb-2 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex overflow-x-auto 2xl:space-x-4 xl:space-x-3 lg:space-x-2 space-x-2 scrollbar-hide scroll-smooth 2xl:px-12 xl:px-8 lg:px-6 md:px-4 px-2 2xl:pb-26 xl:pb-20 lg:pb-16 md:pb-12 pb-8"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              role="list"
              aria-label="Featured products"
            >
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  role="listitem"
                >
                  <div
                    className={`${poppins.className} flex-shrink-0 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 2xl:p-6 xl:p-5 lg:p-4 md:p-3 p-3 2xl:w-72 xl:w-64 lg:w-56 md:w-48 w-40 group 2xl:hover:translate-y-[100px] xl:hover:translate-y-[80px] lg:hover:translate-y-[60px] md:hover:translate-y-[40px] hover:translate-y-[20px] cursor-pointer`}
                  >
                    <div className="relative w-full 2xl:h-72 xl:h-56 lg:h-48 md:h-40 h-32 rounded-xl overflow-hidden 2xl:mb-4 xl:mb-3 lg:mb-2 mb-2 bg-gray-100">
                      <Image
                        src={product.img}
                        alt={product.title}
                        width={288}
                        height={288}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-gray-900 font-medium 2xl:text-base xl:text-sm lg:text-xs md:text-xs sm:text-xs text-xs leading-snug line-clamp-2">
                        {product.title}
                      </h4>
                      <p className="text-orange-500 font-bold 2xl:text-lg xl:text-base lg:text-sm md:text-sm sm:text-xs text-xs">
                        ${product.price}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedSection;
