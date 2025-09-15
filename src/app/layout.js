import "./globals.css";
import Footer from "@/components/Footer";
import ClientProviders from "@/components/ClientProviders";

export const metadata = {
  title: "THE GIFTSIP",
  description: "GIFT SHOP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Client-only providers live here */}
        <ClientProviders>
          {children}
        </ClientProviders>

        <Footer />
      </body>
    </html>
  );
}
