"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { CartProvider } from "@/contexts/CartContext";

export default function ClientProviders({ children }) {
  return (
    <PayPalScriptProvider
      options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD" }}
    >
      <CartProvider>{children}</CartProvider>
    </PayPalScriptProvider>
  );
}
