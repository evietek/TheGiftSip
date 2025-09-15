"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const tabs = ["New Arrivals", "Best Sellers", "Exclusive"];

const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("New Arrivals");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/printify/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          // Take first 6 products and add category logic
          const limitedProducts = data.slice(0, 6).map((product, index) => ({
            ...product,
            category: getProductCategory(index)
          }));
          setProducts(limitedProducts);
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Simple category assignment based on index
  const getProductCategory = (index) => {
    const categories = {
      0: ["New Arrivals", "Best Sellers"],
      1: ["New Arrivals", "Best Sellers"],
      2: ["Best Sellers"],
      3: ["Best Sellers", "Exclusive"],
      4: ["Exclusive"],
      5: ["Exclusive", "New Arrivals"]
    };
    return categories[index] || ["New Arrivals"];
  };

  const filteredProducts = products.filter((product) =>
    product.category.includes(activeTab)
  );

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-10 lg:mb-12 space-y-6 lg:space-y-0">
          {/* Heading */}
          <div className="w-full lg:w-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-gray-900 leading-tight">
              Our all products
            </h2>
            <div className="w-16 h-1 bg-orange-500 mt-2 sm:mt-3"></div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 lg:gap-4 w-full lg:w-auto justify-start lg:justify-end">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 whitespace-nowrap shadow-sm hover:shadow-md
                  ${activeTab === tab 
                    ? "bg-orange-500 text-white transform scale-105 shadow-lg" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          /* Loading State - Mobile Optimized */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="group">
                <div className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm animate-pulse">
                  {/* Image Skeleton */}
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  
                  {/* Content Skeleton */}
                  <div className="p-2 sm:p-4 lg:p-6 space-y-2">
                    <div className="h-3 sm:h-5 lg:h-6 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 sm:h-5 lg:h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Products Grid - Mobile Optimized */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {filteredProducts.map((product, index) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
                <article className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 hover:-translate-y-1">
                  {/* Product Image Container */}
                  <div className="aspect-square overflow-hidden bg-gray-50 relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      priority={index < 4}
                    />
                    
                    {/* Hover Overlay - Hidden on mobile */}
                    <div className="absolute inset-0 bg-black/0 sm:group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  
                  {/* Product Info - Mobile Optimized */}
                  <div className="p-2 sm:p-4 lg:p-6">
                    <div className="space-y-1 sm:space-y-0">
                      {/* Product Name - Smaller on mobile */}
                      <h3 className="text-gray-900 text-xs sm:text-base lg:text-xl font-medium leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
                        {product.name}
                      </h3>
                      
                      {/* Price - Smaller on mobile */}
                      <div className="flex justify-between items-center sm:justify-start sm:mt-1">
                        <span className="text-orange-500 text-sm sm:text-lg lg:text-xl font-semibold">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 9h6m-3 3v6" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                Try selecting a different category to see available products.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default ProductSection;