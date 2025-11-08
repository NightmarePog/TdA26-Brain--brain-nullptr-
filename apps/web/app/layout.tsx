import type { Metadata } from "next";
import { Dosis } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layouts/navbar";

const dosis = Dosis({
  variable: "--font-dosis",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tour de App 2026",
  description: "Tour de App 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dosis.className}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
