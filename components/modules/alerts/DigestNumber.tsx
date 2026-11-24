import { cn } from "@/lib/cn";

interface DigestNumberProps {
  label: string;
  value: string;
  /** Red number, used for Unassigned and SLA breaches. */
  isAlarm?: boolean;
}

export default function DigestNumber({ label, value, isAlarm = false }: DigestNumberProps) {
  return (
    <div className="flex-1 bg-[#f7f7f8] px-3.5 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">{label}</p>
      <p className={cn("mt-0.5 text-[30px] font-light", isAlarm ? "text-brand-dark" : "text-ink")}>{value}</p>
    </div>
  );
}
