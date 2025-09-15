"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { FiMinus, FiPlus, FiTrash2, FiArrowLeft, FiShoppingBag } from "react-icons/fi";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();

  const [pricing, setPricing] = useState({ lines: [], subtotal: 0, currency: "USD" });
  const [loading, setLoading] = useState(false);
  const [priceErr, setPriceErr] = useState("");

  const pricingPayload = useMemo(
    () =>
      items.map((it) => ({
        cartId: it.cartId,
        productId: it.productId,
        variantId: Number(it.variantId),
        quantity: it.quantity,
      })),
    [items]
  );

  useEffect(() => {
    let abort = false;
    async function fetchPrices() {
      if (!items.length) {
        setPricing({ lines: [], subtotal: 0, currency: "USD" });
        setPriceErr("");
        return;
      }
      setLoading(true);
      setPriceErr("");

      try {
        const res = await fetch("/api/printify/price-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: pricingPayload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to price cart");
        if (!abort) setPricing(data);
      } catch (e) {
        if (!abort) {
          setPriceErr(e.message || "Failed to price cart");
          setPricing({ lines: [], subtotal: 0, currency: "USD" });
        }
      } finally {
        if (!abort) setLoading(false);
      }
    }
    fetchPrices();
    return () => { abort = true; };
  }, [pricingPayload, items.length]);

  const qtyCount = items.reduce((n, it) => n + (it.quantity || 0), 0);

  // index server lines by cartId
  const byCartId = useMemo(() => {
    const map = new Map();
    pricing.lines.forEach((l) => map.set(l.cartId, l));
    return map;
  }, [pricing.lines]);

  // simple skeleton block
  const Skeleton = ({ width = "w-16" }) => (
    <span className={`inline-block h-4 ${width} rounded bg-gray-200 animate-pulse`} />
  );

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-40">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <FiShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
              <Link href="/products" className="inline-flex items-center bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                <FiArrowLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                    <button onClick={clearCart} className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Clear Cart
                    </button>
                  </div>
                </div>

                {priceErr && (
                  <div className="px-4 sm:px-6 py-3 bg-red-50 text-red-700 text-sm">
                    {priceErr}
                  </div>
                )}

                <div className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const priced = byCartId.get(item.cartId);
                    const unit = priced?.unitPrice ?? 0;
                    const line = priced?.lineTotal ?? 0;
                    const unavailable = !!priced?.unavailable;

                    // Prefer server-confirmed titles
                    const displaySize  = priced?.sizeTitle  || item.selectedSize || null;
                    const displayColor = priced?.colorTitle || item.selectedColor?.name || null;

                    return (
                      <div key={item.cartId} className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0 mx-auto sm:mx-0">
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 text-center sm:text-left">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                              {item.title || (loading ? <Skeleton width="w-40" /> : "Product")}
                            </h3>
                            <p className="text-sm text-gray-500">{item.category}</p>

                            {/* Selected Options */}
                            <div className="mt-2 space-y-1">
                              {displayColor && (
                                <div className="flex items-center justify-center sm:justify-start space-x-2">
                                  <span className="text-sm text-gray-600">Color:</span>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: item.selectedColor?.hex || undefined }}
                                    />
                                    <span className="text-sm text-gray-900">
                                      {displayColor}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {displaySize && (
                                <div className="flex items-center justify-center sm:justify-start space-x-2">
                                  <span className="text-sm text-gray-600">Size:</span>
                                  <span className="text-sm text-gray-900">
                                    {displaySize}
                                  </span>
                                </div>
                              )}
                              {unavailable && (
                                <div className="text-xs text-red-600">
                                  This variant is unavailable. Please remove it or choose another option.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.cartId, Math.max(1, item.quantity - 1))}
                                className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                                disabled={loading}
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                                disabled={loading}
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Prices (server) */}
                            <div className="text-center sm:text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {loading ? <Skeleton width="w-16" /> : unavailable ? "Unavailable" : `$${line.toFixed(2)}`}
                              </p>
                              {!unavailable && (
                                <p className="text-sm text-gray-500">
                                  {loading ? <Skeleton width="w-12" /> : `$${unit.toFixed(2)} each`}
                                </p>
                              )}
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full mx-auto sm:mx-0"
                              disabled={loading}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-20 lg:top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({qtyCount} item{qtyCount !== 1 ? "s" : ""})
                    </span>
                    <span className="font-medium">
                      {loading ? <Skeleton width="w-16" /> : `$${pricing.subtotal.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{loading ? <Skeleton width="w-16" /> : `$${pricing.subtotal.toFixed(2)}`}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className={`w-full ${loading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"} text-white py-3 px-4 rounded-lg transition-colors text-center font-medium block`}
                    aria-disabled={loading}
                  >
                    {loading ? "Calculating…" : "Proceed to Checkout"}
                  </Link>
                  <Link
                    href="/products"
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium block"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading && <p className="mt-4 text-sm text-gray-500">Refreshing prices…</p>}
        </div>
      </div>
    </>
  );
}
