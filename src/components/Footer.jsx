"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiArrowRight,
} from "react-icons/fi";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: "ok"|"err", text: string }

  const onSubscribe = async (e) => {
    e.preventDefault();
    setMessage(null);

    // basic front-end validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: "err", text: "Please enter a valid email." });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Subscription failed");

      setMessage({ type: "ok", text: "Thanks! We’ve added you to the list." });
      setEmail("");
    } catch (err) {
      setMessage({ type: "err", text: err.message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="relative mt-24 text-gray-700">
      <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
      <div className="relative bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Newsletter */}
          <div className="relative -mt-10 mb-12 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 sm:p-8 shadow-[0_10px_30px_-12px_rgba(234,88,12,0.25)]">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Join the GiftSip community
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Fresh drops, early access, and members-only perks.
                </p>
              </div>

              <form
                onSubmit={onSubscribe}
                className="flex w-full max-w-md rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="ml-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                >
                  {submitting ? "Subscribing..." : "Subscribe"} <FiArrowRight size={16} />
                </button>
              </form>
            </div>

            {message && (
              <p
                className={`mt-3 text-sm ${
                  message.type === "ok" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
          {/* Main grid (centered) */}
          <div className="grid grid-cols-1 gap-10 pb-10 text-center md:grid-cols-3 md:text-left justify-items-center">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="GiftSip"
                  width={140}
                  height={100}
                  className="h-32 w-auto"
                  priority
                />
              </Link>
              <p className="max-w-xs text-sm leading-6 text-gray-600 mx-auto md:mx-0">
                Curated gifts, smarter shopping. We bring you products that
                delight, with quality you can trust.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3 md:justify-start">
                {[FiFacebook, FiInstagram, FiTwitter].map(
                  (Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="rounded-full border border-gray-200 p-2 text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Icon size={18} />
                    </a>
                  )
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                Quick Links
              </h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-orange-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-orange-600"
                  >
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="text-gray-600 hover:text-orange-600"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-orange-600"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
                Contact
              </h4>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center justify-center gap-2 text-gray-600 md:justify-start">
                  <FiMail className="text-orange-500" />
                  <a
                    href="mailto:contact@example.com"
                    className="hover:text-orange-600"
                  >
                    contact@example.com
                  </a>
                </li>
                <li className="flex items-center justify-center gap-2 text-gray-600 md:justify-start">
                  <FiPhone className="text-orange-500" />
                  <a href="tel:+00000000000" className="hover:text-orange-600">
                    (+00) 000 0000000
                  </a>
                </li>
                <li className="flex items-center justify-center gap-2 text-gray-600 md:justify-start">
                  <FiMapPin className="text-orange-500" />
                  Your City, Country
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 py-6 text-sm text-gray-500 md:flex-row">
            <p>© {new Date().getFullYear()} GiftSip. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/legal/terms" className="hover:text-orange-600">
                Terms &amp; Conditions
              </Link>
              <span className="hidden sm:inline text-gray-300">|</span>
              <Link href="/legal/privacy" className="hover:text-orange-600">
                Privacy Policy
              </Link>
              <span className="hidden sm:inline text-gray-300">|</span>
              <Link href="/legal/cookies" className="hover:text-orange-600">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
