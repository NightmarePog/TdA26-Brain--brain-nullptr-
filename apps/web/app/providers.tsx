"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import Navbar from "@/components/layouts/navbar";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Footer from "@/features/footer/footer";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <SidebarInset className="flex flex-1 flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </SidebarInset>
          </div>
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
