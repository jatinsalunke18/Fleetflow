import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FleetFlow | Fleet & Logistics Management",
  description: "Centralized fleet management system for vehicles, drivers, trips, maintenance, and analytics.",
};

import { Providers } from "@/components/Providers";
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-[var(--font-inter)]`}>
        <Providers session={await auth()}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
