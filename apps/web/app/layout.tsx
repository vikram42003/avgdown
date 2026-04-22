import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";

import Sidebar from "@/components/sidebar/Sidebar";
import { cn } from "@/lib/utils";

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AvgDown | Dashboard",
  description: "DCA Investment Alerter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", "dark", geistSans.variable, geistMono.variable, "font-sans", raleway.variable)}>
      <body className="flex h-dvh bg-background text-foreground overflow-hidden">
        <Sidebar />
        <main className="flex flex-col w-full shrink-2 overflow-y-auto p-6 lg:p-10">{children}</main>
      </body>
    </html>
  );
}
