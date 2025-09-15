"use client";
import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { Inter, Poppins } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({
  weight: ["600"],
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export default function ThankYouPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-24 pt-40">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className={`${inter.className} text-4xl sm:text-5xl font-bold text-gray-900 mb-4`}>
            Thank You!
          </h1>
          <p className={`${poppins.className} text-lg sm:text-xl text-gray-600 mb-6`}>
            Your message has been sent successfully. We`ll get back to you within 24 hours.
          </p>
          <p className={`${poppins.className} text-gray-500`}>
            We appreciate you reaching out to us and look forward to helping you with your inquiry.
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className={`${inter.className} text-lg font-semibold text-gray-900`}>
              Need immediate assistance?
            </h3>
          </div>
          <p className={`${poppins.className} text-gray-600 mb-4`}>
            You can also reach us directly at:
          </p>
          <div className="space-y-2">
            <p className={`${poppins.className} text-gray-700`}>
              <strong>Email:</strong> hello@giftsip.com
            </p>
            <p className={`${poppins.className} text-gray-700`}>
              <strong>Phone:</strong> +1 (555) 123-4567
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-600 hover:text-white transition-colors duration-200 font-medium"
          >
            Browse Products
          </Link>
        </div>

      </div>
      </div>
    </>
  );
}
