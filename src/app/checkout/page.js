"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { FiArrowLeft, FiCheck, FiAlertCircle, FiChevronDown, FiLock } from "react-icons/fi";
import { useShippingQuote } from "@/hooks/useShippingQuote";
import { useAddressData } from "@/hooks/useAddressData";
import { formatPrice } from "@/utils/currency";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();

  // form state
  const [formData, setFormData] = useState({
    email: "", firstName: "", lastName: "", address: "",
    city: "", state: "", zipCode: "", country: "", countryCode: "", phone: "",
  });
  const [errors, setErrors] = useState({});
  const [orderComplete, setOrderComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // address hooks
  const { countries, states, cities, fetchStates, fetchCities } = useAddressData();

  // server-price the cart
  const [pricing, setPricing] = useState({ subtotal: 0, currency: "USD", lines: [] });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingErr, setPricingErr] = useState("");

  const pricingItems = useMemo(() => items.map(i => ({
    cartId: i.cartId,
    productId: i.productId || i.printifyProductId,
    variantId: i.variantId,
    quantity: i.quantity,
  })), [items]);

  useEffect(() => {
    let abort = false;
    async function run() {
      if (!items.length) { setPricing({ subtotal: 0, currency: "USD", lines: [] }); return; }
      setPricingLoading(true); setPricingErr("");
      try {
        const res = await fetch("/api/printify/price-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: pricingItems }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Pricing failed");
        if (!abort) setPricing(data);
      } catch (e) {
        if (!abort) setPricingErr(e.message || "Pricing failed");
      } finally {
        if (!abort) setPricingLoading(false);
      }
    }
    run();
    return () => { abort = true; };
  }, [pricingItems, items.length]);

  // shipping quote (your existing hook)
  const { shippingQuote, isLoading: isShippingLoading, error: shippingError, isAddressComplete } =
    useShippingQuote(items, formData);

  // totals
  const total = useMemo(() => {
    const ship = shippingQuote?.cost || 0;
    return (Number(pricing.subtotal || 0)) + Number(ship);
  }, [pricing.subtotal, shippingQuote]);

  // validation
  const isFormValid = useMemo(() => {
    const hasAll = formData.email && formData.firstName && formData.lastName && formData.address &&
                   formData.city && formData.state && formData.zipCode && formData.phone &&
                   formData.country && formData.countryCode; // ensure country + ISO2 present
    return hasAll && !pricingLoading && !isShippingLoading && !pricingErr && !shippingError && isAddressComplete;
  }, [formData, pricingLoading, isShippingLoading, pricingErr, shippingError, isAddressComplete]);

  if (items.length === 0 && !orderComplete) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-50">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl font-bold mb-4">No items to checkout</h1>
            <Link href="/products" className="inline-flex items-center bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
              <FiArrowLeft className="mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (orderComplete) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-30">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
              <p className="text-gray-600 mb-6">Weâ€™ll email your receipt shortly.</p>
              <Link href="/products" className="inline-flex items-center bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      const c = countries.find(x => x.name === value);
      setFormData(p => ({ ...p, country: value, countryCode: (c?.code || "").toUpperCase(), state: "", city: "" }));
      if (c?.code) fetchStates(c.code);
    } else if (name === "state") {
      setFormData(p => ({ ...p, state: value, city: "" }));
      if (formData.countryCode) fetchCities(formData.countryCode, value);
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) e.email = "Valid email required";
    if (!formData.firstName) e.firstName = "First name required";
    if (!formData.lastName) e.lastName = "Last name required";
    if (!formData.address) e.address = "Address required";
    if (!formData.city) e.city = "City required";
    if (!formData.state) e.state = "State required";
    if (!formData.zipCode) e.zipCode = "ZIP required";
    if (!formData.phone) e.phone = "Phone required";
    if (!formData.country) e.country = "Country required";
    if (!formData.countryCode) e.country = "Country required"; // same key to show in one place
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID; // must be set

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16 sm:pt-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input name="email" value={formData.email} onChange={onChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <input name="phone" value={formData.phone} onChange={onChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.phone ? "border-red-500" : "border-gray-300"}`} />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["First Name *", "firstName"],
                  ["Last Name *", "lastName"],
                  ["Address *", "address", "sm:col-span-2", "123 Main St"],
                ].map(([label, name, span, ph]) => (
                  <div key={name} className={span || ""}>
                    <label className="block text-sm font-medium mb-1">{label}</label>
                    <input
                      name={name}
                      value={formData[name]}
                      onChange={onChange}
                      className={`w-full px-3 py-2 border rounded-lg ${errors[name] ? "border-red-500" : "border-gray-300"}`}
                      placeholder={ph || ""}
                    />
                    {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
                  </div>
                ))}

                {/* City */}
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <div className="relative">
                    {cities.length ? (
                      <select
                        name="city"
                        value={formData.city}
                        onChange={onChange}
                        className={`w-full px-3 py-2 border rounded-lg appearance-none ${errors.city ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Select City</option>
                        {cities.map((c, i) => <option key={`${c.name}-${i}`} value={c.name}>{c.name}</option>)}
                      </select>
                    ) : (
                      <input
                        name="city"
                        value={formData.city}
                        onChange={onChange}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.city ? "border-red-500" : "border-gray-300"}`}
                      />
                    )}
                    {cities.length > 0 && <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                  </div>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium mb-1">State/Province *</label>
                  <div className="relative">
                    {states.length ? (
                      <select
                        name="state"
                        value={formData.state}
                        onChange={onChange}
                        className={`w-full px-3 py-2 border rounded-lg appearance-none ${errors.state ? "border-red-500" : "border-gray-300"}`}
                      >
                        <option value="">Select State/Province</option>
                        {states.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
                      </select>
                    ) : (
                      <input
                        name="state"
                        value={formData.state}
                        onChange={onChange}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.state ? "border-red-500" : "border-gray-300"}`}
                      />
                    )}
                    {states.length > 0 && <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                  </div>
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                {/* ZIP */}
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP/Postal Code *</label>
                  <input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={onChange}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.zipCode ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium mb-1">Country *</label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={onChange}
                      className={`w-full px-3 py-2 border rounded-lg appearance-none ${errors.country ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.cartId} className="flex items-center space-x-3">
                    <Image src={item.image} alt={item.title} width={50} height={50} className="rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.selectedColor?.name ? `${item.selectedColor.name} ` : ""}{item.selectedSize ? `Size ${item.selectedSize}` : ""}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{pricingLoading ? "â€¦" : `$${(pricing.subtotal || 0).toFixed(2)}`}</span>
                </div>

                {/* Shipping section */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <div className="text-right">
                    {isShippingLoading ? (
                      <div className="flex items-center space-x-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500"></div>
                        <span className="text-gray-500 text-xs">Calculatingâ€¦</span>
                      </div>
                    ) : shippingError ? (
                      <div className="flex items-center space-x-1">
                        <FiAlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-red-500 text-xs">Error</span>
                      </div>
                    ) : shippingQuote ? (
                      <div>
                        <span className="font-medium">
                          {formatPrice(shippingQuote.cost, shippingQuote.currency)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {shippingQuote.method} ({shippingQuote.estimatedDays} days)
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">Enter address</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{`$${total.toFixed(2)}`}</span>
                  </div>
                </div>
              </div>

              {/* PayPal */}
              <PayPalScriptProvider
                options={{
                  "client-id": paypalClientId || "",
                  currency: "USD",
                  intent: "capture",

                  components: "buttons",
                  // "data-client-token": "", // only if you use advanced cards
                }}
              >
                <div className="w-full" style={{ minWidth: 260 }}>
                  <PayPalButtons
                    style={{ layout: "vertical", height: 45, tagline: false }}
                    // fundingSource="paypal" // uncomment to force PayPal only
                    createOrder={async () => {
                      // Frontend validation
                      if (!validateForm()) {
                        throw new Error("Complete required fields");
                      }
                      if (pricingLoading || isShippingLoading || pricingErr || shippingError) {
                        throw new Error("Pricing/shipping not ready");
                      }

                      // Server creates the order with server-verified totals
                      const res = await fetch("/api/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          items: pricingItems,
                          shippingAddress: formData,
                          shippingCost: shippingQuote?.cost || 0,
                        }),
                      });
                      const text = await res.text();
                      let data = {};
                      try { data = JSON.parse(text); } catch {}
                      if (!res.ok || !data?.id) {
                        throw new Error(data?.error || "PayPal create failed");
                      }
                      return data.id; // return orderID
                    }}
                    onApprove={async (data) => {
                      setIsProcessing(true);
                      try {
                        // Capture on the server
                        const capRes = await fetch("/api/paypal/capture-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderID: data.orderID }),
                        });
                        const capText = await capRes.text();
let cap = {};
try { cap = JSON.parse(capText); } catch {}
if (!capRes.ok) {
  throw new Error(cap?.error || "Capture failed");
}

                        // (Optional) verify amounts here by re-computing server-side

                        // After successful capture, create the Printify order on server
                        const orderRes = await fetch("/api/printify/create-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email: formData.email,
                            phone: formData.phone,
                            shipping: {
                              firstName: formData.firstName,
                              lastName: formData.lastName,
                              address: formData.address,
                              city: formData.city,
                              state: formData.state,
                              zipCode: formData.zipCode,
                              country: formData.country,
                              countryCode: formData.countryCode,
                            },
                            items: items.map((i) => ({
                              cartId: i.cartId,
                              title: i.title,
                              quantity: i.quantity,
                              printifyProductId: i.productId || i.printifyProductId,
                              variantId: i.variantId,
                              sku: i.sku,
                            })),
                            externalId: `PAYPAL-${data.orderID}-${Date.now()}`,
                            shippingMethod: 1,
                            shippingCost: shippingQuote?.cost || 0,
                            shippingMethodName: shippingQuote?.method || "Standard",
                          }),
                        });
                        if (!orderRes.ok) {
                          const e = await orderRes.text();
                          throw new Error("Failed to create Printify order");
                        }

                        setOrderComplete(true);
                        clearCart();
                      } catch (err) {
                        alert("Payment captured but order processing failed. Weâ€™ll contact you, or reach out to support with your PayPal order ID.");
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    onCancel={() => {
                      // Optional: surface a message or analytics here
                    }}
                    onError={(err) => {
                      alert("Something went wrong with PayPal.");
                    }}
                    disabled={isProcessing || !isFormValid || !paypalClientId}
                  />
                </div>
              </PayPalScriptProvider>

              {/* Status */}
              {(!isFormValid || pricingLoading || isShippingLoading) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  {!isFormValid ? "Complete required fields and wait for pricing/shipping." :
                    pricingLoading ? "Fetching pricesâ€¦" :
                    isShippingLoading ? "Calculating shippingâ€¦" : ""}
                </div>
              )}

              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                <FiLock className="w-4 h-4" />
                <span>Secure payment via PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}