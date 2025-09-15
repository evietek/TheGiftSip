"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Inter, Poppins } from "next/font/google";
import { 
  Heart, 
  Users, 
  Award, 
  Truck, 
  Shield, 
  Star,
  ArrowRight,
  Globe,
  Mail,

} from "lucide-react";

const inter = Inter({
  weight: ["600"],
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export default function AboutPage() {
  const stats = [
    { icon: Users, number: "1000+", label: "Happy Customers" },
    { icon: Award, number: "500+", label: "Original Designs" },
    { icon: Globe, number: "50+", label: "Countries Served" },
    { icon: Star, number: "4.9", label: "Average Rating" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Inspired Design & Lasting Quality",
      description: "Our original designs are full of personality. We use ultra-soft tees and vibrant, dishwasher-safe mugs to ensure your gift brings joy for years to come."
    },
    {
      icon: Shield,
      title: "Worry-Free Shopping",
      description: "Your privacy is our priority. Shop with confidence knowing your personal and payment information is always protected by the latest security."
    },
    {
      icon: Truck,
      title: "Reliable Delivery",
      description: "We know you're excited for your order. We work with trusted partners to ensure your gift is carefully packaged and delivered safely to your doorstep."
    },
    {
      icon: Users,
      title: "Happiness Guaranteed",
      description: "We're not happy unless you are. Our friendly support team is always here to help make sure you have a perfect experience from start to finish."
    }
  ];


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white py-16 sm:py-24 pt-40 md:pt-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className={`${inter.className} text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6`}>
                About <span className="text-purple-600">GiftSip</span>
              </h1>
              <p className={`${poppins.className} text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed`}>
              GiftSip was born from a simple idea, the best gifts tell a story. Since 2020, we’ve been designing unique mugs, t-shirts, and custom products that help you celebrate the people and passions you love.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <stat.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className={`${inter.className} text-3xl sm:text-4xl font-bold text-gray-900 mb-2`}>
                    {stat.number}
                  </div>
                  <p className={`${poppins.className} text-gray-600`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Story Section */}
<div className="bg-gray-50 py-16 sm:py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid lg:grid-cols-2 gap-12 items-center justify-center">
      <div className="text-center lg:text-left">
        <h2 className={`${inter.className} text-3xl sm:text-4xl font-bold text-gray-900 mb-6`}>
          Our Story
        </h2>
        <div className={`${poppins.className} space-y-4 text-gray-600 leading-relaxed`}>
          <p>
GiftSip was born from a familiar frustration. Our founder, Sarah, was tired of impersonal, generic gifts. She believed the best presents should reflect a unique story—an inside joke, a shared memory, or a favorite passion. Unable to find what she was looking for, she decided to create it.
          </p>
          <p>
Today, that simple idea is our mission. We design meaningful graphic tees and custom mugs that help you celebrate the connections that matter most. Every item is crafted to spark a smile and create a moment, turning a simple gift into something truly special.
          </p>
        </div>
        <Link 
          href="/products" 
          className="inline-flex items-center mt-8 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <span className="font-medium">Explore Our Products</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
      <div className="relative flex justify-center">
        <Image
          src="/about/mockup-main.png"
          alt="Our Story"
          width={400}
          height={200}
          className="rounded-lg shadow-lg"
        />
      </div>
    </div>
  </div>
</div>


        {/* Values Section */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`${inter.className} text-3xl sm:text-4xl font-bold text-gray-900 mb-4`}>
              Our Promise
              </h2>
              <p className={`${poppins.className} text-lg text-gray-600 max-w-2xl mx-auto`}>
              These principles are at the heart of every gift we help create.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <value.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className={`${inter.className} text-xl font-semibold text-gray-900 mb-3`}>
                    {value.title}
                  </h3>
                  <p className={`${poppins.className} text-gray-600`}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact CTA Section */}
        <div className="bg-purple-600 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={`${inter.className} text-3xl sm:text-4xl font-bold text-white mb-4`}>
              Let`s Create Something Memorable.
            </h2>
            <p className={`${poppins.className} text-lg text-purple-100 mb-8 max-w-2xl mx-auto`}>
Dive into our collection to find the perfect gift. Have a question? Our friendly team is always happy to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Link>
              <Link 
                href="/products" 
                className="inline-flex items-center border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-purple-600 transition-colors duration-200 font-medium"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

