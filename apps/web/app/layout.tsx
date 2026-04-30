import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/common/Providers";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    <html lang="en" className={cn("h-full antialiased dark", geistSans.variable, geistMono.variable, raleway.variable)}>
      <body className="h-dvh">
        <Providers>
          <AppSidebar />
          <main className="flex min-w-0 flex-1 flex-col px-6 py-4 lg:px-10 lg:py-6">
            <SidebarTrigger className="scale-125 mb-4 -ml-1"/>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
