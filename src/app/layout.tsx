import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import { getStoreSettings } from "@/lib/services/products";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Glock Giyim | Seçkin Erkek Giyim & Koleksiyon",
  description: "Modern, iddialı ve kaliteli erkek giyim koleksiyonu. Hızlı WhatsApp siparişi.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-[#f4f4f5]">
        <CartProvider>
          {children}
          <CartDrawer whatsappNumber={settings?.whatsapp_number} />
        </CartProvider>
      </body>
    </html>
  );
}
