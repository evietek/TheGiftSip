"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Inter, Poppins } from "next/font/google";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const CTASection = () => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [products, setProducts] = useState([
    {
      id: 1,
      image: "/cta/cta-main.png",
      alt: "Black T-shirt with graffiti design",
    },
    {
      id: 2,
      image: "/cta/cta-side.png",
      alt: "Best Dad Ever mug with photo",
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/printify/products", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const realProducts = data.slice(0, 3).map((product) => ({
            id: product.id,
            image: product.image,
            alt: product.name || "Product image",
          }));
          setProducts((prev) => [...prev, ...realProducts]);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const nextProduct = useCallback(() => {
    setCurrentProductIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prevProduct = useCallback(() => {
    setCurrentProductIndex(
      (prev) => (prev - 1 + products.length) % products.length
    );
  }, [products.length]);

  const currentProduct = products[currentProductIndex];
  const sideProduct = products[(currentProductIndex + 1) % products.length];

  // Keyboard navigation (← → keys)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextProduct();
      if (e.key === "ArrowLeft") prevProduct();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextProduct, prevProduct]);

  return (
    <section
      className="bg-white py-8 sm:py-12 md:py-16 2xl:py-20 px-4 sm:px-6 md:px-8 relative overflow-hidden"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-7xl mx-auto bg-gray-900 rounded-lg sm:rounded-xl 2xl:rounded-2xl p-6 sm:p-8 md:p-12 2xl:p-16">
        <div className="grid grid-cols-12 gap-6 sm:gap-8 md:gap-10 2xl:gap-12 items-center">
          {/* Left Content */}
          <header className="col-span-12 md:col-span-6 lg:col-span-5 2xl:col-span-4 space-y-4 sm:space-y-6 2xl:space-y-8 text-center md:text-left">
            <h2
              id="cta-heading"
              className={`${inter.className} text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-white`}
            >
              Find Your New Favorite.
            </h2>
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-colors duration-300 flex items-center space-x-2 group mx-auto md:mx-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Explore the collection"
            >
              <span>Explore The Collection</span>
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            </button>
            <p
              className={`${poppins.className} text-gray-300 text-base sm:text-lg leading-relaxed max-w-md mx-auto md:mx-0`}
            >
              Your next go-to graphic tee or perfect coffee mug is waiting. Dive
              into our collection and discover a design that’s all you.
            </p>
          </header>

          {/* Right Content */}
          <div className="col-span-12 md:col-span-6 lg:col-span-7 2xl:col-span-8 relative flex justify-center md:justify-start items-center mt-8 md:mt-0 md:ml-4 lg:ml-8 2xl:ml-12">
            {/* Decorative background */}
            <div aria-hidden="true" className="absolute inset-0 flex justify-center md:justify-start">
              <div className="bg-[#AFDF6F] rounded-2xl 2xl:rounded-3xl w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-110 lg:h-100 2xl:w-110 2xl:h-100 absolute top-4 sm:top-6 md:top-8 2xl:top-10 -left-2 sm:-left-3 md:-left-4 2xl:-left-5">
                <Image
                  src="/about/zigzag.png"
                  alt=""
                  role="presentation"
                  width={300}
                  height={300}
                  className="absolute bottom-0 right-0 w-48 h-36 sm:w-64 sm:h-48 md:w-80 md:h-60 lg:w-96 lg:h-72 2xl:w-[450px] 2xl:h-[350px] z-10"
                />
              </div>
            </div>

            {/* Main Product */}
            <div className="relative z-10">
              <div className="w-64 h-80 sm:w-80 sm:h-96 md:w-96 md:h-120 lg:w-100 lg:h-120 2xl:w-100 2xl:h-120 flex items-center justify-center">
                <Image
                  src={currentProduct?.image || "/placeholder.png"}
                  alt={currentProduct?.alt || "Product"}
                  width={350}
                  height={380}
                  priority
                  className="object-contain rounded-xl 2xl:rounded-2xl transition-all duration-500 w-48 h-56 sm:w-64 sm:h-72 md:w-80 md:h-96 lg:w-96 lg:h-110 2xl:w-full 2xl:h-full"
                />
              </div>
            </div>

            {/* Side Product */}
            {sideProduct && (
              <div className="absolute left-48 sm:left-64 md:left-80 lg:left-96 2xl:left-120 top-1/2 transform -translate-y-1/2 z-10 hidden sm:block">
                <Image
                  src={sideProduct?.image || "/placeholder.png"}
                  alt={sideProduct?.alt || "Product"}
                  width={350}
                  height={380}
                  className="object-contain rounded-lg 2xl:rounded-xl transition-all duration-500 w-40 h-48 sm:w-48 sm:h-56 md:w-64 md:h-72 lg:w-80 lg:h-96 2xl:w-full 2xl:h-full"
                />
              </div>
            )}

            {/* Navigation */}
            <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 2xl:bottom-0 right-2 sm:right-4 md:right-6 2xl:right-8 flex space-x-2 sm:space-x-3 z-20">
              <button
                onClick={prevProduct}
                aria-label="Show previous product"
                className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-500 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <button
                onClick={nextProduct}
                aria-label="Show next product"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
