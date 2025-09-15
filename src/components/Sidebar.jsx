"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";

const colorHexMap = {
  White: "#ffffff",
  Black: "#000000",
  Red: "#C62A32",
  Royal: "#084f97",
  Navy: "#1a2237",
  "Light Blue": "#d6e6f7",
  "Carolina Blue": "#7BA4DB",
  "Forest Green": "#223b26",
  "Irish Green": "#279436",
  "Safety Green": "#F2FB00",
  Purple: "#3C214E",
  "Light Pink": "#FEE0EB",
  "Sport Grey": "#CACACA",
  Ash: "#F6F6F6",
  "Dark Heather": "#454545",
  "Dark Chocolate": "#31221D",
  Maroon: "#642838",
  Gold: "#ffb81c",
  Orange: "#FF6B35",
  Yellow: "#FFD700",
  Green: "#10B981",
  Gray: "#9CA3AF",
  Grey: "#9CA3AF",
  Brown: "#92400E",
  Teal: "#14B8A6",
  Lime: "#65A30D",
  Cyan: "#06B6D4",
  Magenta: "#D946EF",
  Silver: "#9CA3AF",
  Pink: "#EC4899",
  "Light Purple": "#C4B5FD",
};

const Sidebar = ({ filters, setFilters, isOpen, setIsOpen }) => {
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    color: true,
    price: true,
  });

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const res = await fetch("/api/printify/sidebar-metadata");
        const data = await res.json();

        setColors(data.colors || []);
        setCategories(data.categories || []);

        const max = Math.ceil(data.priceRange?.[1] || 1000000);
        setMaxPrice(max);

        setFilters((prev) => ({
          ...prev,
          priceRange: [0, max],
        }));
      } catch (error) {
      }
    };

    fetchSidebarData();
  }, [setFilters]);

  const handleColorSelect = (color) => {
    setFilters((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handlePriceChange = (e) => {
    const value = Math.ceil(parseFloat(e.target.value));
    setFilters((prev) => ({
      ...prev,
      priceRange: [0, value],
    }));
  };

  const handleCategorySelect = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? null : category,
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: null,
      colors: [],
      priceRange: [0, maxPrice],
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.priceRange[1] !== maxPrice) count++;
    return count;
  };

  const SectionHeader = ({ title, section, count = null }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full text-left py-2 hover:text-purple-600 transition-colors duration-200"
    >
      <div className="flex items-center gap-2">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
          {title}
        </h3>
        {count !== null && count > 0 && (
          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp size={18} className="text-gray-500" />
      ) : (
        <ChevronDown size={18} className="text-gray-500" />
      )}
    </button>
  );

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header with close button for mobile */}
      <div className="flex lg:hidden items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-purple-100 text-purple-700 text-sm px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Breadcrumb - Hidden on mobile */}
        <div className="hidden lg:block mb-6 xl:mb-8 text-sm text-gray-600">
          <span className="hover:text-purple-600 cursor-pointer transition-colors duration-200">
            Home
          </span>
          <span className="mx-2">/</span>
          <span className="hover:text-purple-600 cursor-pointer transition-colors duration-200">
            Category
          </span>
          <span className="mx-2">/</span>
          {filters.category ? (
            <span className="text-gray-900 font-medium capitalize">
              {filters.category}
            </span>
          ) : (
            <span className="text-gray-900 font-medium">All</span>
          )}
        </div>

        {/* Clear Filters Button */}
        {getActiveFiltersCount() > 0 && (
          <div className="mb-6">
            <button
              onClick={clearFilters}
              className="w-full py-2 px-4 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 border border-purple-200 hover:border-purple-300"
            >
              Clear All Filters ({getActiveFiltersCount()})
            </button>
          </div>
        )}

        {/* Category Section */}
        <div className="mb-6 lg:mb-8">
          <SectionHeader
            title="Category"
            section="category"
            count={filters.category ? 1 : 0}
          />
          {expandedSections.category && (
            <div className="mt-4 space-y-2 lg:space-y-3 max-h-60 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full text-left py-2 px-3 lg:px-4 rounded-lg transition-all duration-200 text-sm lg:text-base ${
                    filters.category === category
                      ? "bg-purple-100 text-purple-700 font-medium border border-purple-200"
                      : "text-gray-700 hover:text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Section */}
        <div className="mb-6 lg:mb-8">
          <SectionHeader
            title="Color"
            section="color"
            count={filters.colors.length}
          />
          {expandedSections.color && (
            <div className="mt-4">
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6 gap-2 lg:gap-3 max-h-48 overflow-y-auto">
                {colors.map((colorName) => {
                  const isSelected = filters.colors.includes(colorName);
                  const colorHex = colorHexMap[colorName] || "#ccc";
                  const isLightColor = ["White", "Ash", "Light Blue", "Light Pink", "Safety Green"].includes(colorName);

                  return (
                    <div key={colorName} className="relative">
                      <button
                        onClick={() => handleColorSelect(colorName)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
                          isSelected
                            ? "ring-2 ring-purple-500 ring-offset-2 shadow-lg"
                            : "ring-1 ring-gray-300 hover:ring-gray-400 shadow-sm hover:shadow-md"
                        }`}
                        style={{
                          backgroundColor: colorHex,
                          border: isLightColor ? "2px solid #e5e7eb" : "none",
                        }}
                        title={colorName}
                        aria-label={`Select ${colorName} color`}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isLightColor ? "bg-gray-800" : "bg-white"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filters.colors.length > 0 && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700 mb-2 font-medium">
                    Selected Colors ({filters.colors.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {filters.colors.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        <div
                          className="w-3 h-3 rounded-full border border-purple-300"
                          style={{ backgroundColor: colorHexMap[color] || "#ccc" }}
                        />
                        {color}
                        <button
                          onClick={() => handleColorSelect(color)}
                          className="hover:text-purple-900"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="mb-6 lg:mb-8">
          <SectionHeader
            title="Price"
            section="price"
            count={filters.priceRange[1] !== maxPrice ? 1 : 0}
          />
          {expandedSections.price && (
            <div className="mt-4 space-y-4">
              {/* Keep only one set of scale labels */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>$0</span>
                <span>${maxPrice.toLocaleString()}</span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={handlePriceChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  style={{
                    background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${
                      (filters.priceRange[1] / maxPrice) * 100
                    }%, #E5E7EB ${(filters.priceRange[1] / maxPrice) * 100}%, #E5E7EB 100%)`,
                  }}
                />
              </div>


              {/* Max price input (kept) */}
              <div className="mt-1">
                <label className="block text-xs text-gray-600 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  min="0"
                  max={maxPrice}
                  value={Math.round(filters.priceRange[1])}
                  onChange={(e) => {
                    const value = Math.min(
                      maxPrice,
                      Math.max(0, parseInt(e.target.value) || 0)
                    );
                    setFilters((prev) => ({
                      ...prev,
                      priceRange: [0, value],
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter max price"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Apply Button */}
      <div className="lg:hidden border-t border-gray-200 p-4">
        <button
          onClick={() => setIsOpen(false)}
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
        >
          Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 xl:w-96 bg-white border-r border-gray-200 h-full">
        {sidebarContent}
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white w-full max-w-sm shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Custom Slider Styles */}
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
        }
        input[type="range"]:focus {
          outline: none;
        }
        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
