import { PlusIcon } from "lucide-react";

export default function Dashboard() {
  return (
    <section className="">
      {/* Putting down all the stuff i might need on this page in a div */}
      <div className="flex justify-between">
        <h2 className="font-bold text-4xl">Overview</h2>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black font-medium cursor-pointer hover:bg-gray-200">
          <PlusIcon className="w-4 h-4" />
          Create New Watchlist
        </button>
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
