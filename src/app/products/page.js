"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar_2 from "@/components/Navbar_2";
import Sidebar from "@/components/Sidebar";
import ProductGrid from "@/components/ProductGrid";
import RecentProducts from "@/components/RecentProducts";

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ProductsInner />
    </Suspense>
  );
}

function ProductsInner() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    colors: [],
    category: null,
    priceRange: [0, 1000000],
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Handle URL search parameters
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  const handleCategoryChange = (category) => {
    setFilters((prev) => ({
      ...prev,
      category: category,
    }));
  };

  return (
    <>
      <Navbar_2
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCategoryChange={handleCategoryChange}
      />
      <div className="flex flex-col lg:flex-row min-h-screen">
        <Sidebar filters={filters} setFilters={setFilters} />
        <div className="flex-1 p-4 lg:p-6">
          <ProductGrid filters={filters} searchQuery={searchQuery} />
        </div>
      </div>
      <RecentProducts />
    </>
  );
}
