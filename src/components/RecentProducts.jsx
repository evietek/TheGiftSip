"use client";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const RecentProducts = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isMobile, setIsMobile] = useState(false);
  
  // Touch-only drag functionality states
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1280) setItemsPerPage(6); // xl
      else if (window.innerWidth >= 1024) setItemsPerPage(5); // lg  
      else if (window.innerWidth >= 768) setItemsPerPage(4); // md
      else if (window.innerWidth >= 640) setItemsPerPage(3); // sm
      else setItemsPerPage(2); // mobile
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/printify/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          const limitedProducts = data.slice(0, 12).map((product, index) => {
            let tag = "Featured";
            if (index % 3 === 0) tag = "Discount";
            else if (index % 4 === 0) tag = "New Arrival";
        
            return {
              ...product,
              model: product.category || "Gift Item",
              originalPrice: tag === "Discount" ? (product.price * 1.2).toFixed(2) : null,
              discount: tag === "Discount" ? "20%" : null,
              tag,
              hasDiscount: tag === "Discount",
              isNew: tag === "New Arrival",
              seller: "GiftSip Store",
            };
          });
          setProducts(limitedProducts);
        }
        
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Touch-only drag handlers
  const handleTouchStart = (e) => {
    if (!isMobile || !containerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging || !containerRef.current) return;
    
    e.preventDefault();
    const x = e.touches[0].clientX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    setIsDragging(false);
    
    // Snap to nearest item after drag on mobile
    if (containerRef.current) {
      const itemWidth = containerRef.current.scrollWidth / products.length;
      const newIndex = Math.round(containerRef.current.scrollLeft / itemWidth);
      const snappedIndex = Math.max(0, Math.min(newIndex, products.length - itemsPerPage));
      
      containerRef.current.scrollTo({
        left: snappedIndex * itemWidth,
        behavior: 'smooth'
      });
      
      setCurrentIndex(snappedIndex);
    }
  };

  // Desktop button navigation
  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerPage >= products.length ? 0 : prev + itemsPerPage
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - itemsPerPage < 0 ? Math.max(0, products.length - itemsPerPage) : prev - itemsPerPage
    );
  };

  // Update scroll position for desktop navigation
  useEffect(() => {
    if (!isMobile && containerRef.current && !isDragging) {
      const itemWidth = containerRef.current.scrollWidth / products.length;
      containerRef.current.scrollTo({
        left: currentIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, isMobile, isDragging, products.length]);

  // Mobile scroll position tracking
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const handleScroll = () => {
      if (!containerRef.current || isDragging) return;
      
      const container = containerRef.current;
      const itemWidth = container.scrollWidth / products.length;
      const newIndex = Math.round(container.scrollLeft / itemWidth);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(Math.max(0, Math.min(newIndex, products.length - itemsPerPage)));
      }
    };

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [currentIndex, products.length, itemsPerPage, isDragging, isMobile]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(currentIndex, currentIndex + itemsPerPage);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < products.length;

  return (
    <div className="bg-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
              Recently Viewed
            </h2>
            <p className="text-gray-600 text-sm">
              Continue where you left off
            </p>
          </div>
          
          {/* Navigation Controls - Desktop Only */}
          {!isMobile && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevSlide}
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 transition-all duration-200 ${
                  canGoPrev 
                    ? 'hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm active:scale-95' 
                    : 'opacity-40 cursor-not-allowed'
                }`}
                disabled={!canGoPrev}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <button 
                onClick={nextSlide}
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 transition-all duration-200 ${
                  canGoNext 
                    ? 'hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm active:scale-95' 
                    : 'opacity-40 cursor-not-allowed'
                }`}
                disabled={!canGoNext}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Products Container */}
        <div 
          ref={containerRef}
          className={`${
            isMobile 
              ? 'overflow-x-auto scrollbar-hide' 
              : 'overflow-hidden'
          }`}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading ? (
            <div className={`${
              isMobile 
                ? 'flex gap-4 w-max pb-2' 
                : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
            }`}>
              {[...Array(isMobile ? 8 : itemsPerPage)].map((_, index) => (
                <div 
                  key={index} 
                  className={`bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse ${
                    isMobile 
                      ? 'flex-shrink-0 w-44 sm:w-52' 
                      : ''
                  }`}
                >
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`${
              isMobile 
                ? 'flex gap-4 w-max pb-2' 
                : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
            }`}>
              {(isMobile ? products : currentProducts).map((product) => (
                <div
                  key={product.id}
                  className={`transition-all duration-300 hover:scale-[1.02] ${
                    isMobile 
                      ? 'flex-shrink-0 w-44 sm:w-52' 
                      : ''
                  }`}
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-gray-200/60 hover:border-gray-300 transition-all duration-300 cursor-pointer group h-full">
                      
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          draggable={false}
                        />
                        
                        {/* Discount Badge */}
                        {product.hasDiscount && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
                            -{product.discount}
                          </div>
                        )}
                        
                        {/* New Badge */}
                        {product.isNew && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
                            New
                          </div>
                        )}
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-gray-700 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-500 text-xs mb-3">
                          {product.model}
                        </p>
                        
                        {/* Price */}
                        <div className="mb-3">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Seller */}
                        <p className="text-xs text-blue-600 font-medium">
                          by {product.seller}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Page Indicators */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${
                Math.floor(currentIndex / itemsPerPage) === i 
                  ? 'bg-gray-700 w-8 h-2' 
                  : 'bg-gray-300 w-2 h-2'
              }`}
            />
          ))}
        </div>

        {/* Scrollbar hiding styles */}
        <style jsx>{`
          .scrollbar-hide {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </div>
  );
};

export default RecentProducts;