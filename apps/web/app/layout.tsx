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
    <html lang="en" className={cn("antialiased dark", geistSans.variable, geistMono.variable, raleway.variable)}>
      <body>
        <Providers>
          <AppSidebar />
          <main className="w-0 flex-1 p-6 lg:p-10">
            <SidebarTrigger className="mb-4" />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
