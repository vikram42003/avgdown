import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <section className="">
      {/* Putting down all the stuff i might need on this page in a div */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-4xl">Overview</h2>

        <Button size="lg" className="rounded-md">
          <PlusIcon />
          Create New Watchlist
        </Button>
      </div>

      <div>
        <div>
          graphs for like the stock prices, updates every 15 min in tandem with our lambda worker some stat cards or
          whatever like alerts triggered in last week, watchlists youre tracking all that
        </div>
        <div>another RECTANGLE to the right side that shows recently triggered alerts in like a list scrollable</div>
      </div>
      {/* Do not forget some sort of empty state, like no alerts no watchlists */}
    </section>
  );
}
