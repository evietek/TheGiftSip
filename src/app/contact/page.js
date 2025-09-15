"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { Inter, Poppins } from "next/font/google";
import { 
  Mail, 
  Phone, 
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
  HelpCircle,
  Truck,
  CreditCard
} from "lucide-react";

const inter = Inter({
  weight: ["600"],
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Redirect to thank you page
        window.location.href = '/thank-you';
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "info@thegiftsip.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri 9AM-6PM EST"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: "Monday - Friday: 9AM - 6PM",
      description: "Saturday: 10AM - 4PM"
    }
  ];

  const faqs = [
    {
      icon: HelpCircle,
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days."
    },
    {
      icon: Truck,
      question: "Do you ship internationally?",
      answer: "Yes! We ship to over 50 countries worldwide. International shipping takes 7-14 business days."
    },
    {
      icon: CreditCard,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and Apple Pay for secure checkout."
    },
    {
      icon: MessageCircle,
      question: "Can I customize my order?",
      answer: "Absolutely! All our products can be customized with your own text, images, and designs."
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
                Get in <span className="text-purple-600">Touch</span>
              </h1>
              <p className={`${poppins.className} text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed`}>
                Have questions about our products or need help with your order? 
                We`re here to help you create the perfect gift.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg text-center hover:bg-gray-100 transition-colors duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                    <info.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className={`${inter.className} text-lg font-semibold text-gray-900 mb-2`}>
                    {info.title}
                  </h3>
                  <p className={`${poppins.className} text-gray-900 font-medium mb-1`}>
                    {info.details}
                  </p>
                  <p className={`${poppins.className} text-gray-600 text-sm`}>
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form & FAQ Section */}
        <div className="bg-gray-50 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
                <h2 className={`${inter.className} text-2xl sm:text-3xl font-bold text-gray-900 mb-6`}>
                  Send us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className={`${poppins.className} block text-sm font-medium text-gray-700 mb-2`}>
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className={`${poppins.className} block text-sm font-medium text-gray-700 mb-2`}>
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`${poppins.className} block text-sm font-medium text-gray-700 mb-2`}>
                        Inquiry Type
                      </label>
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                      >
                        <option value="general">General Question</option>
                        <option value="order">Order Support</option>
                        <option value="custom">Custom Design</option>
                        <option value="shipping">Shipping Inquiry</option>
                        <option value="return">Returns & Exchanges</option>
                      </select>
                    </div>

                    <div>
                      <label className={`${poppins.className} block text-sm font-medium text-gray-700 mb-2`}>
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
                        placeholder="What's this about?"
                      />
                    </div>

                    <div>
                      <label className={`${poppins.className} block text-sm font-medium text-gray-700 mb-2`}>
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className={`${inter.className} text-2xl sm:text-3xl font-bold text-gray-900 mb-6`}>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <faq.icon className="w-5 h-5 text-purple-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className={`${inter.className} text-lg font-semibold text-gray-900 mb-2`}>
                            {faq.question}
                          </h3>
                          <p className={`${poppins.className} text-gray-600`}>
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Help */}
                <div className="mt-8 bg-purple-50 p-6 rounded-lg">
                  <h3 className={`${inter.className} text-lg font-semibold text-gray-900 mb-3`}>
                    Need More Help?
                  </h3>
                  <p className={`${poppins.className} text-gray-600 mb-4`}>
                    Can`t find what you`re looking for? Our support team is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a 
                      href="mailto:info@thegiftsip.com"
                      className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </a>
                    <a 
                      href="tel:+15551234567"
                      className="inline-flex items-center border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-600 hover:text-white transition-colors duration-200 text-sm font-medium"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

