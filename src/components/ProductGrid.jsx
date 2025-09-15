"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Search } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

const ProductGrid = ({ filters, searchQuery = "" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const itemsPerPage = 15;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/printify/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllProducts(data);
          setFilteredProducts(data); // Initially show all
        } else {
          setAllProducts([]);
          setFilteredProducts([]);
        }
      } catch (err) {
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...allProducts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.keywords?.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (filters.category) {
      result = result.filter((p) =>
        p.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by color
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        filters.colors.some((selectedColor) =>
          p.colors && p.colors.some((productColor) =>
            productColor.toLowerCase() === selectedColor.toLowerCase()
          )
        )
      );
    }

    // Filter by price range
    result = result.filter(
      (p) =>
        p.price >= filters.priceRange[0] &&
        p.price <= filters.priceRange[1]
    );

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [filters, allProducts, searchQuery]);

  const getCurrentPageProducts = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.slice(start, end);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product) => {
    // Get the first available color and size for quick add to cart
    const firstColor = product.colors?.[0];
    const firstSize = product.variants?.[0]?.options?.[0]; // This is a simplified approach
    
    addToCart(product, firstColor, firstSize, 1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 sm:px-3 sm:py-2 text-gray-500 hover:text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg hover:bg-purple-50 disabled:hover:bg-transparent"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
      </button>
    );

    // First page and ellipsis
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-2 py-2 sm:px-4 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-2 sm:px-4 text-sm rounded-lg transition-all duration-200 ${
            currentPage === i
              ? "bg-purple-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-2 text-gray-400">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-2 py-2 sm:px-4 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all duration-200"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 sm:px-3 sm:py-2 text-gray-500 hover:text-purple-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200 rounded-lg hover:bg-purple-50 disabled:hover:bg-transparent"
        aria-label="Next page"
      >
        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
      </button>
    );

    return pages;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <div className="p-3 lg:p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 text-gray-300">
        <Search size="100%" />
      </div>
      <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
        No products found
      </h3>
      <p className="text-sm sm:text-base text-gray-500 max-w-md">
        {searchQuery 
          ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or filters.`
          : "No products match your current filters. Try adjusting your selection."
        }
      </p>
    </div>
  );

  return (
    <div className="w-full">
      {/* Results Summary */}
      {!loading && (
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            {filteredProducts.length === 0 
              ? "No products found"
              : `Showing ${((currentPage - 1) * itemsPerPage) + 1}-${Math.min(currentPage * itemsPerPage, filteredProducts.length)} of ${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`
            }
            {searchQuery && (
              <span className="ml-1">
                for "<span className="font-medium text-gray-900">{searchQuery}</span>"
              </span>
            )}
          </p>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-8">
            {getCurrentPageProducts().map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all duration-300 group cursor-pointer">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 p-2 sm:p-3 lg:p-4">
                    {product.badge && (
                      <span
                        className={`absolute top-2 left-2 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-semibold text-white rounded ${product.badgeColor} z-10`}
                      >
                        {product.badge}
                      </span>
                    )}

                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Sold Out Overlay */}
                    {product.soldOut && (
                      <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                        <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-2 sm:p-3 lg:p-4">
                    <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200 leading-tight">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 sm:gap-2 mb-2">
                      <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs sm:text-sm text-gray-500 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button for All Devices */}
                    <div className="flex mt-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={product.soldOut}
                        className="w-full py-2 px-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        <ShoppingCart size={14} />
                        <span>Add to Cart</span>
                      </button>
                    </div>

                    {/* Colors Preview */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {product.colors.slice(0, 4).map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                        {product.colors.length > 4 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{product.colors.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 sm:gap-2 mt-8 px-4">
              <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg border border-gray-200 p-1">
                {renderPagination()}
              </div>
            </div>
          )}

          {/* Page Info for Mobile */}
          {totalPages > 1 && (
            <div className="flex sm:hidden justify-center mt-4">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;