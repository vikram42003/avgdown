import { formatCurrency, formatRelativeTime } from "@/lib/formatters";
import { RecentAlertResponse } from "@avgdown/types";

const mockRecentAlert: RecentAlertResponse = {
  id: crypto.randomUUID(),
  triggeredPrice: 98,
  smaValue: 100.5,
  createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 min ago
  watchlistEntry: {
    asset: {
      name: "Bitcoin",
      symbol: "BTC USD",
      exchange: "BINANCE",
    },
    smaPeriod: 20,
  },
};

const RecentAlerts = () => {
  return (
    <div>
      <h4 className="font-semibold text-lg mb-4 ml-4">Recent Alerts</h4>
      <div className="space-y-3 max-h-155  overflow-y-auto custom-scrollbar-primary">
        {new Array(10).fill(0).map(() => {
          return <AlertCard key={crypto.randomUUID()} alert={mockRecentAlert} />;
        })}
      </div>
    </div>
  );
};

const AlertCard = ({ alert }: { alert: RecentAlertResponse }) => {
  const exchange = alert.watchlistEntry.asset.exchange;
  const deltaPct = (((alert.triggeredPrice - alert.smaValue) / alert.smaValue) * 100).toFixed(2);

  return (
    <div className="glass px-3 py-2 rounded space-y-1">
      <p className="font-medium">
        {alert.watchlistEntry.asset.symbol}{" "}
        <span className="font-normal text-muted-foreground text-sm">· {alert.watchlistEntry.asset.name}</span>
      </p>
      <p className="text-sm">
        {formatCurrency(alert.triggeredPrice, exchange)} crossed below SMA-{alert.watchlistEntry.smaPeriod} (
        {formatCurrency(alert.smaValue, exchange)})
        <br />
        <span className="text-destructive font-medium">{deltaPct}%</span>
      </p>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatRelativeTime(alert.createdAt)}</span>
        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default RecentAlerts;
