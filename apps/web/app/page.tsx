import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-6xl font-bold mb-4 tracking-tighter">AvgDown</h1>
      <p className="text-xl text-muted-foreground mb-8 text-center max-w-[600px]">
        Smarter Dollar Cost Averaging. Get alerted when your favorite assets hit key technical levels.
      </p>
      <Link href="/dashboard">
        <Button size="lg" className="rounded-full px-8 text-lg">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}
