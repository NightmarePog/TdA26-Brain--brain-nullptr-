"use client";

import { Dosis } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layouts/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const dosis = Dosis({
  variable: "--font-dosis",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <QueryClientProvider client={queryClient}>
        <body className={dosis.className}>
          <p className="size-0">Hello TdA</p>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
          </ThemeProvider>
        </body>
      </QueryClientProvider>
    </html>
  );
}
