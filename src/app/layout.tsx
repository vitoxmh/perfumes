import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/main.scss";
import { CartProvider } from "@/lib/cart-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Perfumes.cl | Perfumes árabes originales en Chile",
    template: "%s | Perfumes.cl",
  },
  description:
    "Tienda de perfumería árabe en Chile: Eau de Parfum, body mists y sets de las mejores marcas árabes. Despachos a todo Chile.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
