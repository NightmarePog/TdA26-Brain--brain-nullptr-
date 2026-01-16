import { Dosis } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const dosis = Dosis({
  subsets: ["latin"],
  variable: "--font-dosis",
});

export const metadata = {
  title: "ThinkAcademy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dosis.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
