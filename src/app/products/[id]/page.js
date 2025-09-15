"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Facebook,
  Linkedin,
  Twitter,
  Mail,
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar_2";
import RecentProducts from "@/components/RecentProducts";



// --- Random-but-stable utilities (seed from product id) ---
const hashCode = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
};

const seededRand = (seed) => {
  // Mulberry32
  let t = seed + 0x6D2B79F5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pickRatingAndReviews = (key) => {
  const seed = hashCode(key || "fallback");
  const rnd = seededRand(seed);

  // rating 3.7–4.8, rounded to 0.1 (slight center bias)
  const base = 3.7, span = 1.1;
  const skew = (rnd() + rnd()) / 2;
  const ratingRaw = base + skew * span;
  const rating = Math.round(ratingRaw * 10) / 10;

  // reviews 20–200 (cap)
  const rcSkew = Math.pow(rnd(), 1.2);
  const reviews = Math.round(20 + rcSkew * (200 - 20));

  return { rating, reviews };
};



// Enhanced loading skeleton components
const ImageSkeleton = () => (
  <div className="space-y-4">
    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden h-96 md:h-[500px] animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
    <div className="flex space-x-3 overflow-x-auto">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl animate-pulse flex-shrink-0">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-xl"></div>
        </div>
      ))}
    </div>
  </div>
);

const ProductInfoSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Title */}
    <div className="space-y-3">
      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
    </div>
    
    {/* Rating */}
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
    
    {/* Price */}
    <div className="h-10 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg w-32"></div>
    
    {/* Product Info */}
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
      ))}
    </div>
    
    {/* Options */}
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="flex space-x-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-200 rounded-full"></div>
        ))}
      </div>
    </div>
    
    {/* Add to cart */}
    <div className="h-12 bg-gradient-to-r from-orange-200 to-orange-300 rounded-xl w-full"></div>
  </div>
);

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [reviews, setReviews] = useState(null);
    

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/printify/products/${id}`);
        const data = await res.json();
        setProduct(data);

        // Set default selections
        if (Array.isArray(data.colors) && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        if (Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const { rating, reviews } = pickRatingAndReviews(String(id));
    setRating(rating);
    setReviews(reviews);
  }, [id]);
  

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb skeleton */}
          <div className="mb-8">
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <ImageSkeleton />
            <ProductInfoSkeleton />
          </div>
          
          {/* Tabs skeleton */}
          <div className="mt-16">
            <div className="border-b">
              <div className="flex space-x-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="py-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ["/placeholder.png"];
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const specs = Array.isArray(product.specs) ? product.specs : [];
  const tags = Array.isArray(product.tags) ? product.tags.slice(0, 8) : [];

  // Extract key points from description using custom tags
  const extractKeyPoints = (description) => {
    if (typeof description !== "string") return [];
    
    // First decode HTML entities
    const decodedDescription = description
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    
    // Look for various keypoint tag patterns (both HTML-encoded and regular)
    const patterns = [
      /<(?:keypoint|kp)>(.*?)<\/(?:keypoint|kp)>/gi,
      /<keypoint>(.*?)<\/keypoint>/gi,
      /<kp>(.*?)<\/kp>/gi,
      /\[keypoint\](.*?)\[\/keypoint\]/gi,
      /\[kp\](.*?)\[\/kp\]/gi,
      // HTML-encoded patterns
      /&lt;(?:keypoint|kp)&gt;(.*?)&lt;\/(?:keypoint|kp)&gt;/gi,
      /&lt;keypoint&gt;(.*?)&lt;\/keypoint&gt;/gi,
      /&lt;kp&gt;(.*?)&lt;\/kp&gt;/gi
    ];
    
    const allMatches = [];
    
    patterns.forEach(pattern => {
      const matches = decodedDescription.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match
            .replace(/<\/?(?:keypoint|kp)>/gi, '')
            .replace(/\[(?:keypoint|kp)\]/gi, '')
            .replace(/\[\/(?:keypoint|kp)\]/gi, '')
            .replace(/&lt;\/?(?:keypoint|kp)&gt;/gi, '')
            .replace(/&lt;(?:keypoint|kp)&gt;/gi, '')
            .replace(/&lt;\/?(?:keypoint|kp)&gt;/gi, '')
            .trim();
          if (cleanMatch && !allMatches.includes(cleanMatch)) {
            allMatches.push(cleanMatch);
          }
        });
      }
    });
    
    return allMatches;
  };

  const extractedKeyPoints = extractKeyPoints(product.description);

  // Clean description by removing keypoint tags
  const cleanDescription = (description) => {
    if (typeof description !== "string") return "";
    
    return description
      .replace(/<(?:keypoint|kp)>.*?<\/(?:keypoint|kp)>/gi, '') // Remove keypoint tags
      .replace(/\[(?:keypoint|kp)\].*?\[\/(?:keypoint|kp)\]/gi, '') // Remove bracket keypoint tags
      .replace(/&lt;(?:keypoint|kp)&gt;.*?&lt;\/(?:keypoint|kp)&gt;/gi, '') // Remove HTML-encoded keypoint tags
      .replace(/&lt;keypoint&gt;.*?&lt;\/keypoint&gt;/gi, '') // Remove HTML-encoded keypoint tags
      .replace(/&lt;kp&gt;.*?&lt;\/kp&gt;/gi, '') // Remove HTML-encoded kp tags
      .replace(/<br\s*\/?>(\s*\.:)?/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const descriptionParas = cleanDescription(product.description);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    // Add to cart with selected options
    addToCart(product, selectedColor, selectedSize, quantity);
    
    // Simulate a brief delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setAddingToCart(false);
    
    // Show success message (you could add a toast notification here)
    alert('Item added to cart successfully!');
  };

  const breadcrumb = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: product.category || "Product", href: "#", current: true },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Enhanced Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50/50 rounded-full px-4 py-2 w-fit">
            {breadcrumb.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-300">/</span>}
                <a 
                  href={item.href} 
                  className={`transition-colors duration-200 ${
                    item.current 
                      ? "text-purple-600 font-medium" 
                      : "hover:text-gray-700 hover:underline"
                  }`}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Enhanced Image Gallery */}
          <div className="space-y-6">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-lg group">
              <button
                onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <div className="relative overflow-hidden">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer rounded-2xl"></div>
                )}
                <Image 
                  src={images[selectedImage]} 
                  alt="Product" 
                  className="w-full h-auto object-cover transition-opacity duration-300"
                  onLoad={() => setImageLoading(false)}
                  style={{ opacity: imageLoading ? 0 : 1 }}
                />
              </div>
              
              <button
                onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
              
              {/* Image indicator dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      selectedImage === index ? "bg-white scale-125" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Enhanced thumbnail grid */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200 hover:scale-105 ${
                    selectedImage === index 
                      ? "border-purple-500 shadow-lg ring-2 ring-purple-100" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  {selectedImage === index && (
                    <div className="absolute inset-0 bg-purple-500/10 rounded-xl"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Product Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>

              {/* Enhanced Rating */}
{/* Enhanced Rating (JS version) */}
<div className="flex flex-col sm:flex-row sm:items-center gap-4">
  <div className="flex items-center space-x-1">
    {(() => {
      const r = rating ?? 4.2; // fallback while computing
      const full = Math.floor(r);
      const hasHalf = r - full >= 0.5;
      return [1,2,3,4,5].map((i) => {
        const isFull = i <= full;
        const isHalf = !isFull && hasHalf && i === full + 1;
        return (
          <Star
            key={i}
            className={
              "w-5 h-5 " +
              (isFull
                ? "text-yellow-400 fill-current"
                : isHalf
                  ? "text-yellow-400 fill-current opacity-50"
                  : "text-gray-300")
            }
          />
        );
      });
    })()}
    <span className="ml-2 text-sm font-medium text-gray-700">
      {(rating ?? 4.2).toFixed(1)}
    </span>
  </div>
  <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
    {(reviews ?? 832).toLocaleString()} reviews
  </span>
</div>


              {/* Enhanced Price */}
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {typeof product.price === "number" ? `$${product.price.toFixed(2)}` : "N/A"}
                </span>
              </div>
            </div>

            {/* Enhanced Product Info */}
            <div className="bg-gray-50/50 rounded-xl p-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Product ID:</span>
                  <span className="text-gray-600 ml-2 font-mono">{product.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Category:</span>
                  <a href="#" className="text-purple-600 hover:text-purple-700 ml-2 transition-colors duration-200">
                    {product.category}
                  </a>
                </div>
              </div>
              
              {tags.length > 0 && (
                <div>
                  <span className="font-medium text-gray-900 block mb-2">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full hover:bg-purple-200 transition-colors duration-200 cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Color Selection */}
            {colors.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Color</h3>
                  {selectedColor && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {selectedColor.name}
                    </span>
                  )}
                </div>
                <div className="flex space-x-3 flex-wrap gap-2">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-12 h-12 rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                        color.class || "bg-gray-300"
                      } ${
                        selectedColor?.name === color.name
                          ? "ring-2 ring-purple-500 ring-offset-2 shadow-lg"
                          : "border-gray-300 hover:border-gray-400 shadow-sm"
                      }`}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <div className="absolute inset-0 rounded-xl bg-black/10"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Size Selection */}
            {sizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Size</h3>
                  {selectedSize && (
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {selectedSize}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {sizes.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                        selectedSize === size
                          ? "border-purple-500 text-purple-600 bg-purple-50 shadow-lg"
                          : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Key Features */}
            {extractedKeyPoints.length > 0 && (
              <div className="bg-green-50/50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Key Features
                </h3>
                <div className="grid gap-3">
                  {extractedKeyPoints.slice(0, 4).map((point, i) => (
                    <div key={i} className="flex items-start space-x-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
                {extractedKeyPoints.length > 4 && (
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors duration-200">
                    View all features →
                  </button>
                )}
              </div>
            )}

            {/* Enhanced Quantity and Add to Cart */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
  <div className="flex items-center gap-4 flex-wrap">
    {/* Quantity */}
    <div className="flex items-center gap-2">
      <span className="font-semibold text-gray-900 text-sm">Qty:</span>
      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))} 
          className="p-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
          disabled={quantity <= 1}
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 border-x-2 border-gray-200 font-semibold min-w-[50px] text-center text-sm">
          {quantity}
        </span>
        <button 
          onClick={() => setQuantity(quantity + 1)} 
          className="p-2 hover:bg-gray-50 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    {/* Total */}
    <div className="flex items-center gap-2">
      <span className="font-semibold text-gray-900 text-sm">Total:</span>
      <span className="text-xl font-bold text-gray-900">
        ${(product.price * quantity).toFixed(2)}
      </span>
    </div>
    
    {/* Add to Cart */}
    <button 
      onClick={handleAddToCart}
      disabled={addingToCart}
      className="flex-1 min-w-[200px] bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      {addingToCart ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Adding to Cart...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </>
      )}
    </button>
  </div>
</div>

            {/* Enhanced Share */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50/50 rounded-xl">
              <h3 className="font-semibold text-gray-900">Share this product</h3>
              <div className="flex space-x-3">
                {[
                  { Icon: Facebook, color: "bg-blue-600 hover:bg-blue-700", label: "Facebook" },
                  { Icon: Linkedin, color: "bg-blue-500 hover:bg-blue-600", label: "LinkedIn" },
                  { Icon: Twitter, color: "bg-sky-500 hover:bg-sky-600", label: "Twitter" },
                  { Icon: Mail, color: "bg-gray-600 hover:bg-gray-700", label: "Email" }
                ].map(({ Icon, color, label }, idx) => (
                  <button 
                    key={idx} 
                    className={`p-3 ${color} text-white rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md`}
                    title={`Share on ${label}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Section */}
        <div className="mt-16 lg:mt-24">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { key: "description", label: "Description" },
                { key: "key-features", label: "Key Features" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    activeTab === key 
                      ? "border-purple-500 text-purple-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {label}
                  {key === "reviews" && (
                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      832
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8 lg:py-12">
            {activeTab === "description" && (
              <div className="max-w-4xl">
                <div className="prose prose-gray max-w-none">
                  {descriptionParas.length > 0 ? (
                    <div className="space-y-6">
                      {descriptionParas.map((para, i) => (
                        <p key={i} className="text-gray-700 leading-relaxed text-lg">
                          {para}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No description available for this product.</p>
                    </div>
                  )}
                </div>

                {/* Specifications in description tab */}
                {specs.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Technical Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {specs.map((spec, i) => (
                        <div key={i} className="bg-gray-50 p-6 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-2">{spec.label}</h4>
                          <p className="text-gray-600">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "key-features" && (
              <div className="max-w-4xl">
                {extractedKeyPoints.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {extractedKeyPoints.map((point, i) => (
                      <div key={i} className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
                        <div className="flex items-start space-x-4">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-800 leading-relaxed font-medium">{point}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Key Features Listed</h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      Key features for this product haven`t been specified yet. Check the description tab for more detailed information about this product.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <RecentProducts />
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};

export default ProductPage;