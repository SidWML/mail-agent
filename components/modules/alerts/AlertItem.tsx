import type { Alert } from "@/types/mailbox";
import BreachAlert from "./BreachAlert";
import DigestAlert from "./DigestAlert";
import HighUrgencyAlert from "./HighUrgencyAlert";
import SyncAlert from "./SyncAlert";

/** Pick the card that matches the kind of alert. */
export default function AlertItem({ alert }: { alert: Alert }) {
  switch (alert.kind) {
    case "high_urgency":
      return <HighUrgencyAlert alert={alert} />;
    case "sla_breach":
      return <BreachAlert alert={alert} />;
    case "digest":
      return <DigestAlert alert={alert} />;
    case "sync":
      return <SyncAlert alert={alert} />;
  }
}
