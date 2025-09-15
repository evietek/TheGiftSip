"use client";
// components/Navbar.jsx

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiShoppingBag, FiSearch, FiMenu, FiX } from "react-icons/fi";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { getTotalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu/search on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMobileSearchOpen(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Focus management when opening
  useEffect(() => {
    if (mobileSearchOpen) {
      document.getElementById("mobile-search")?.focus();
    }
  }, [mobileSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearch(false);
      setMobileSearchOpen(false);
      setMobileOpen(false);
    }
  };

  return (
    <nav
      className={
        `fixed inset-x-0 top-0 z-50 flex flex-wrap justify-between items-center px-4 sm:px-6 md:px-8 lg:px-12 transition-colors duration-300 ` +
        (scrolled ? "bg-white shadow-md" : "bg-transparent")
      }
      aria-label="Main navigation"
    >
      {/* LEFT: Logo */}
      <Link href="/" className="flex-shrink-0">
        <Image
          src="/logo.png"
          alt="Company logo"
          width={120}
          height={60}
          className="cursor-pointer ml-4 sm:ml-6 md:ml-16 lg:ml-24 xl:ml-32"
          priority
        />
      </Link>

      {/* DESKTOP NAV */}
      <div className="hidden md:flex items-center space-x-4 md:space-x-6 text-sm font-medium">
        <Link href="/" className="text-black font-semibold">
          Home
        </Link>
        <span className="text-gray-400 hidden md:inline" aria-hidden="true">
          |
        </span>
        <Link href="/about" className="text-black">
          About us
        </Link>
        <span className="text-gray-400 hidden md:inline" aria-hidden="true">
          |
        </span>
        <Link href="/products" className="text-black">
          Products
        </Link>
        <span className="text-gray-400 hidden md:inline" aria-hidden="true">
          |
        </span>
        <Link href="/contact" className="text-black">
          Contact
        </Link>
      </div>

      {/* RIGHT: Cart + Search + Mobile Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 mr-4 sm:mr-6 md:mr-16 lg:mr-24 xl:mr-32">
        {/* MOBILE: Hamburger */}
        <button
          className="md:hidden p-2 border rounded-full border-black hover:bg-gray-100 transition"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => {
            setMobileOpen((v) => !v);
            if (!mobileOpen) setMobileSearchOpen(false);
          }}
        >
          {mobileOpen ? (
            <FiX size={18} className="text-black" />
          ) : (
            <FiMenu size={18} className="text-black" />
          )}
        </button>

        {/* CART */}
        <Link
          href="/cart"
          aria-label={`Cart, ${getTotalItems()} items`}
          className="flex items-center bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-orange-600 transition text-sm sm:text-base relative"
        >
          Cart
          <FiShoppingBag className="ml-1 sm:ml-2" aria-hidden="true" />
          {getTotalItems() > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {getTotalItems()}
            </span>
          )}
        </Link>

        {/* DESKTOP SEARCH */}
        <div className="hidden md:block">
          {showSearch ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <label htmlFor="desktop-search" className="sr-only">
                Search products
              </label>
              <input
                id="desktop-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="px-3 py-1.5 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-3 bg-orange-500 text-white rounded-r-full hover:bg-orange-600 transition"
              >
                <FiSearch size={16} aria-hidden="true" />
                <span className="sr-only">Submit search</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="ml-2 px-2 py-1 text-gray-500 hover:text-gray-700"
              >
                ×<span className="sr-only">Close search</span>
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 border rounded-full border-black hover:bg-gray-100 transition"
              aria-label="Open search"
            >
              <FiSearch size={18} className="text-black" />
            </button>
          )}
        </div>

        {/* MOBILE SEARCH ICON */}
        <button
          className="md:hidden p-2 border rounded-full border-black hover:bg-gray-100 transition"
          aria-label="Toggle search"
          aria-expanded={mobileSearchOpen}
          aria-controls="mobile-search-container"
          onClick={() => {
            setMobileSearchOpen((v) => !v);
            if (!mobileSearchOpen) setMobileOpen(false);
          }}
        >
          <FiSearch size={18} className="text-black" />
        </button>
      </div>

      {/* MOBILE SEARCH BAR */}
      <div
        id="mobile-search-container"
        hidden={!mobileSearchOpen}
        aria-hidden={!mobileSearchOpen}
        className={[
          "md:hidden w-full px-4 pb-3 transition-[max-height,opacity] duration-300 ease-out",
          mobileSearchOpen
            ? "max-h-20 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden",
        ].join(" ")}
      >
        <form onSubmit={handleSearch} className="flex items-stretch gap-2">
          <label htmlFor="mobile-search" className="sr-only">
            Search products
          </label>
          <input
            id="mobile-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            autoFocus
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
          >
            <FiSearch size={16} className="mr-1" aria-hidden="true" />
            <span className="sr-only">Submit search</span>
            Search
          </button>
        </form>
      </div>

      {/* MOBILE MENU */}
      <div
        id="mobile-menu"
        hidden={!mobileOpen}
        aria-hidden={!mobileOpen}
        className={[
          "md:hidden w-full px-4 pb-4 transition-[max-height,opacity] duration-300 ease-out",
          mobileOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden",
        ].join(" ")}
      >
        <div className="grid gap-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="rounded-md px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className="rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
          >
            About us
          </Link>
          <Link
            href="/products"
            onClick={() => setMobileOpen(false)}
            className="rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
          >
            Products
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="rounded-md px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
