import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "../ui/button";

const WebhookPayloadInfoSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 transition-transform active:scale-98">
          View Payload Schema
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-6 overflow-y-auto glass-primary border-l border-border/40">
        <SheetHeader className="px-0 mb-4">
          <SheetTitle>Webhook Payload Contract</SheetTitle>
          <SheetDescription>
            Whenever price conditions cross your specified SMA watchlist thresholds, we will make an HTTP POST request
            to this URL with the following JSON structure:
          </SheetDescription>
        </SheetHeader>
        <div className="rounded-lg bg-black/60 border border-border/20 p-4 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre">
          {`{
  "event": "alert.triggered",
  "triggered_at": "2026-05-18T18:00:00Z",
  "alerts": [
    {
      "alert_id": "00000000-0000-0000-0000-000000000000",
      "symbol": "AAPL",
      "triggered_price": "182.50",
      "sma_value": "187.30"
    }
  ]
}`}
        </div>
        <div className="mt-6 flex flex-col gap-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground text-sm">Key Specifications:</p>
          <ul className="list-disc list-inside flex flex-col gap-1.5 pl-1">
            <li>
              <strong>event</strong>: Always <code className="text-primary">&quot;alert.triggered&quot;</code>.
            </li>
            <li>
              <strong>triggered_at</strong>: Timestamp in UTC ISO-8601 format.
            </li>
            <li>
              <strong>triggered_price & sma_value</strong>: Serialized as strings to preserve high decimal precision.
            </li>
            <li>
              <strong>alert_id</strong>: Corresponds to the Alert ID in the DB (resolvable via the `/alerts` API).
            </li>
            <li>
              <strong>Fire-and-forget</strong>: Requests are sent concurrently and logged on failure. No retries are
              attempted.
            </li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WebhookPayloadInfoSheet;
