import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LegalSection } from "@/components/common/LegalSection";

export const metadata: Metadata = {
  title: "Privacy Policy | AvgDown",
  description: "Learn how AvgDown collects, uses, and protects your personal data and watchlist information.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-background text-foreground antialiased">
      <LandingNav />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4 bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 23, 2026</p>

        <div className="space-y-8 prose prose-invert max-w-none text-muted-foreground leading-relaxed text-sm">
          <LegalSection title="1. Information We Collect">
            <p className="mb-3">
              AvgDown only collects the minimal amount of personal data required to provide our alert services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Credentials:</strong> Your email address and a securely hashed password (or Google OAuth profile identifier) used strictly for authentication.</li>
              <li><strong>Alert Settings:</strong> The stock tickers, exchanges, and Simple Moving Average (SMA) periods you add to your watchlists.</li>
              <li><strong>Contact Information:</strong> Your email address is used to deliver the specific alerts you configure.</li>
            </ul>
          </LegalSection>

          <LegalSection title="2. How We Use Your Data">
            <p className="mb-3">
              We process your data strictly to run the alert system according to your preferences:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To deliver daily price alerts or indicators directly to your configured inbox.</li>
              <li>To maintain, hydrate, and update your personal stock watchlist dashboard.</li>
              <li>We <strong>do not</strong> sell, rent, or monetize your personal information or watchlist data to any third-party advertising services.</li>
            </ul>
          </LegalSection>

          <LegalSection title="3. Data Security and Retention">
            <p>
              Your passwords are encrypted using industry-standard hashing before being saved. We retain your data as long as your account remains active. You can delete your watchlist entries or close your account at any time, which permanently removes your information from our database (subject to automated daily database cleanups that purge deleted histories older than 1 year).
            </p>
          </LegalSection>

          <LegalSection title="4. Third-Party Integrations">
            <p>
              We integrate with AWS SES (Simple Email Service) to transmit transactional emails, and yfinance (Yahoo Finance API) to fetch general stock closes. These services are only provided with the necessary parameters (such as recipient email and stock symbols) to compile and send your notifications.
            </p>
          </LegalSection>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
