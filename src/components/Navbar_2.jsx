"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown, 
  ShoppingCart, 
  Search,
  Menu,
  X
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const NavigationBar = ({ searchQuery = '', setSearchQuery = () => {}, onCategoryChange = () => {} }) => {
  const [selectedCategory, setSelectedCategory] = useState('Category');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const desktopButtonRef = useRef(null);
  const [focusIndex, setFocusIndex] = useState(-1); // for keyboard nav

  const categories = ['Mugs', 'T-shirts'];
  const { getTotalItems } = useCart();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setFocusIndex(-1);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ESC to close desktop dropdown
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setFocusIndex(-1);
        desktopButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category || 'Category');
    setIsDropdownOpen(false);
    setFocusIndex(-1);
    onCategoryChange(category);
    setIsMobileMenuOpen(false);
  };

  // keyboard navigation for desktop dropdown
  const onDesktopDropdownKeyDown = (e) => {
    if (!isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsDropdownOpen(true);
      setFocusIndex(-1);
      return;
    }
    if (!isDropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex((i) => Math.min(i + 1, categories.length)); // 0..len for All Categories + items
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusIndex === 0) handleCategorySelect(null);
      else if (focusIndex > 0) handleCategorySelect(categories[focusIndex - 1]);
    }
  };

  return (
    <>
      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav className="bg-white shadow-sm relative z-50">
        {/* Main Navigation Container */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
              
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="block" aria-label="Home">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={80}
                    height={80}
                    className="cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105 
                             w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                    priority
                  />
                </Link>
              </div>

              {/* Desktop Search Bar */}
              <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                {/* NOTE: removed overflow-hidden to avoid clipping the dropdown */}
                <div className="w-full flex rounded-xl shadow-sm border border-gray-200 
                              focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent 
                              transition-all duration-300 bg-gray-50">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-transparent text-gray-700 placeholder-gray-400
                             focus:outline-none transition-all duration-300 text-sm"
                  />
                  
                  {/* Category Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      ref={desktopButtonRef}
                      onClick={() => {
                        setIsDropdownOpen((o) => !o);
                        setFocusIndex(-1);
                      }}
                      onKeyDown={onDesktopDropdownKeyDown}
                      className="px-4 py-3 bg-white border-l border-gray-200 text-gray-700 
                               hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 
                               flex items-center gap-2 transition-all duration-300 min-w-[140px] justify-center"
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isDropdownOpen}
                      aria-controls="desktop-category-list"
                    >
                      <span className="text-sm font-medium">{selectedCategory}</span>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div
                        id="desktop-category-list"
                        role="listbox"
                        className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 
                                   rounded-xl shadow-lg z-50 ring-1 ring-black/5"
                      >
                        <button
                          role="option"
                          aria-selected={selectedCategory === 'Category'}
                          onMouseEnter={() => setFocusIndex(0)}
                          className={`w-full px-4 py-3 text-left text-sm transition ${focusIndex === 0 ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'}`}
                          onClick={() => handleCategorySelect(null)}
                          type="button"
                        >
                          All Categories
                        </button>
                        {categories.map((category, idx) => {
                          const optionIndex = idx + 1; // shift (0 reserved for All)
                          const focused = focusIndex === optionIndex;
                          return (
                            <button
                              key={category}
                              role="option"
                              aria-selected={selectedCategory === category}
                              onMouseEnter={() => setFocusIndex(optionIndex)}
                              onClick={() => handleCategorySelect(category)}
                              type="button"
                              className={`w-full px-4 py-3 text-left text-sm border-t border-gray-100 transition 
                                         ${focused ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'} 
                                         last:rounded-b-xl`}
                            >
                              {category}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Search Button */}
                  <button
                    type="button"
                    className="px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 
                             transition-all duration-300 hover:scale-[1.02] active:scale-95 
                             flex items-center gap-2 rounded-r-xl"
                  >
                    <Search size={18} />
                    <span className="font-medium">Search</span>
                  </button>
                </div>
              </div>

              {/* Right Side Icons */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                
                {/* Mobile Search Toggle */}
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-all duration-300 
                           hover:scale-110 active:scale-95"
                  type="button"
                  aria-label="Toggle search"
                >
                  <Search size={20} className="text-gray-600" />
                </button>

                {/* Cart Icon */}
                <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-all 
                                           duration-300 hover:scale-110 active:scale-95" aria-label="Cart">
                  <ShoppingCart size={20} className="text-gray-600 hover:text-purple-600 
                                                   transition-colors duration-300 sm:w-6 sm:h-6" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 
                                   text-white text-xs font-bold rounded-full w-5 h-5 flex items-center 
                                   justify-center shadow-lg">
                      {getTotalItems() > 99 ? '99+' : getTotalItems()}
                    </span>
                  )}
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-all duration-300 
                           hover:scale-110 active:scale-95"
                  type="button"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X size={20} className="text-gray-600" />
                  ) : (
                    <Menu size={20} className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Expanded Search */}
        {isSearchExpanded && (
          <div className="lg:hidden bg-white border-b border-gray-200 shadow-sm" ref={searchRef}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex flex-col space-y-3">
                <div className="flex rounded-lg overflow-hidden shadow-sm border border-gray-200 
                              focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 focus:bg-white text-gray-700 
                             placeholder-gray-400 focus:outline-none transition-all duration-300"
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 
                             transition-all duration-300"
                  >
                    <Search size={18} />
                  </button>
                </div>
                
                {/* Mobile Category Selector */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg 
                             text-gray-700 hover:bg-gray-50 flex items-center justify-between 
                             transition-all duration-300"
                    type="button"
                  >
                    <span className="font-medium">{selectedCategory}</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 
                                  rounded-b-lg shadow-xl z-50 mt-1">
                      <button
                        onClick={() => handleCategorySelect(null)}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 hover:text-purple-700 
                                 text-gray-700 transition-all duration-200 font-medium"
                        type="button"
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="w-full px-4 py-3 text-left hover:bg-purple-50 hover:text-purple-700 
                                   text-gray-700 border-t border-gray-100 transition-all duration-200 
                                   font-medium last:rounded-b-lg"
                          type="button"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Slide-out Menu */}
        <div className={`lg:hidden fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl 
                        transform transition-transform duration-300 ease-in-out z-50 
                        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300"
              aria-label="Close menu"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Mobile Menu Content */}
          <div className="p-6 space-y-6">
            
            {/* Quick Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 
                           hover:text-purple-700 transition-all duration-200 font-medium"
                  type="button"
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-purple-50 
                             hover:text-purple-700 transition-all duration-200 font-medium"
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Link */}
            <div className="pt-4 border-t border-gray-200">
              <Link 
                href="/cart" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg 
                         hover:bg-purple-100 transition-all duration-300"
              >
                <div className="flex items-center space-x-3">
                  <ShoppingCart size={20} className="text-purple-600" />
                  <span className="font-medium text-gray-800">Shopping Cart</span>
                </div>
                {getTotalItems() > 0 && (
                  <span className="bg-purple-600 text-white text-sm font-bold rounded-full 
                                 w-6 h-6 flex items-center justify-center">
                    {getTotalItems() > 99 ? '99+' : getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavigationBar;
