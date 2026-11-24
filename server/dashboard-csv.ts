import { NextResponse } from "next/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const cell = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const block = (title: string, header: string[], rows: unknown[][]) =>
  [title, header.map(cell).join(","), ...rows.map((row) => row.map(cell).join(",")), ""].join("\n");

/** The dashboard as one CSV file (opens in Excel): a block per chart, separated by a blank line (DB-13). */
export function dashboardCsvResponse(result: Record<string, any>, days: number) {
  const tiles = result.tiles;
  const parts = [
    `Mailbox dashboard - last ${days} days\n`,
    block("Headline numbers", ["Measure", "Value"], [
      ["Received (range)", tiles.received.range],
      ["Received today", tiles.received.today],
      ["Received this week", tiles.received.week],
      ["Open", tiles.open.total],
      ["Acted", tiles.acted],
      ["Unassigned", tiles.unassigned],
      ["Within SLA %", result.sla.compliancePct],
      ["Past SLA now", result.sla.breachCount],
      ["First reply median (h)", result.response.firstMedian],
      ["First reply slowest 10% (h)", result.response.firstP90],
      ["Time to act median (h)", result.response.ttaMedian],
      ["Time to act slowest 10% (h)", result.response.ttaP90],
    ]),
    block("Mail volume per day", ["Day", "Received", "Acted"], result.volume.map((d: any) => [d.day, d.received, d.acted])),
    block("Mails by category", ["Category", "Mails"], result.byCategory.map((c: any) => [c.name, c.value])),
    block("Open backlog by age", ["Age", "Open mails"], result.backlog.map((b: any) => [b.name, b.value])),
    block("Reply time by category (hours)", ["Category", "Median", "Slowest 10%"], result.response.byCategory.map((c: any) => [c.name, c.median, c.p90])),
    block("Workload per person", ["Person", "Claimed", "Replied", "Acted"], result.workload.map((w: any) => [w.name, w.claimed, w.replied, w.acted])),
    block("Sentiment per day", ["Day", "Positive", "Neutral", "Negative"], result.sentimentTrend.map((d: any) => [d.day, d.positive, d.neutral, d.negative])),
    block("Urgency", ["Urgency", "Mails"], result.urgency.map((u: any) => [u.name, u.value])),
    block("Sentiment", ["Sentiment", "Mails"], result.sentiment.map((u: any) => [u.name, u.value])),
    block("Top senders", ["Sender", "Mails"], result.topSenders.map((u: any) => [u.name, u.value])),
    block("Business units", ["Business unit", "Mails"], result.topBusinessUnits.map((u: any) => [u.name, u.value])),
    block("Countries", ["Country", "Mails"], result.topCountries.map((u: any) => [u.name, u.value])),
    block("Recurring topics", ["Topic", "Mails", "Change %", "Example mails"], result.topics.map((u: any) => [u.name, u.value, u.change ?? "new", (u.examples ?? []).map((e: any) => e.subject).join(" / ")])),
    block("AI quality", ["Measure", "Percent"], [
      ["Sorted by the AI", result.ai.autoSortedPct],
      ["Corrected by people", result.ai.overriddenPct],
      ["Needs review", result.ai.needsReviewPct],
    ]),
  ];

  // The BOM makes Excel read the file as UTF-8.
  return new NextResponse("﻿" + parts.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="mailbox-dashboard-${days}d.csv"`,
    },
  });
}
