import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bendito Café POS",
  description: "Sistema de Punto de Venta para Bendito Café",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#fbfbe2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${plusJakartaSans.variable} ${manrope.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
