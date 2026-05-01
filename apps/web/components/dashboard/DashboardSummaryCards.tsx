interface SummaryCardPropTypes {
  title: string;
  value: string;
}

const SummaryCard = ({ title, value }: SummaryCardPropTypes) => {
  return (
    <div className="w-full sm:w-[calc(50%-1rem)] lg:flex-1 max-w-64 glass-primary px-2 py-4 rounded-md flex flex-col gap-1">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="font-semibold text-xl">{value}</div>
    </div>
  );
};

const DashboardSummaryCards = () => {
  // we fetch data about the last 7 days of triggered alerts and the total watchlists we're tracking and all that from the backend
  return (
    <div className="mt-12 mb-8 flex flex-wrap justify-between lg:justify-around gap-8 text-center">
      <SummaryCard title={"Recent Alerts"} value={"6"} />
      <SummaryCard title={"Active Watchlists"} value={"7"} />
      <SummaryCard title={"Total Assets Tracked"} value={"9"} />
      <SummaryCard title={"Delivery Rate"} value={"99%"} />
    </div>
  );
};

export default DashboardSummaryCards;
