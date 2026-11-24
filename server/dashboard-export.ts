import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { NextResponse } from "next/server";
import type { DashboardResponse } from "@/types/dashboard";

/** One table of the export: a title, a header row and the rows. Every format (CSV, Excel, PDF) prints the same tables (DB-13). */
interface ExportTable {
  title: string;
  header: string[];
  rows: Array<Array<string | number>>;
  /** A sentence or paragraph shown under the title (used for the leadership summary, DB-12). */
  note?: string;
}

export type ExportFormat = "csv" | "xlsx" | "pdf";

function buildTables(result: DashboardResponse): ExportTable[] {
  const { tiles } = result;
  return [
    { title: "Summary for leadership", header: [], rows: [], note: result.narrative },
    {
      title: "Headline numbers",
      header: ["Measure", "Value"],
      rows: [
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
      ],
    },
    { title: "Mail volume per day", header: ["Day", "Received", "Acted"], rows: result.volume.map((d) => [d.day, d.received, d.acted]) },
    { title: "Mails by category", header: ["Category", "Mails"], rows: result.byCategory.map((c) => [c.name, c.value]) },
    { title: "Open backlog by age", header: ["Age", "Open mails"], rows: result.backlog.map((b) => [b.name, b.value]) },
    {
      title: "Reply time by category (hours)",
      header: ["Category", "Median", "Slowest 10%"],
      rows: result.response.byCategory.map((c) => [c.name, c.median, c.p90]),
    },
    {
      title: "Workload per person",
      header: ["Person", "Claimed", "Replied", "Acted"],
      rows: result.workload.map((w) => [w.name, w.claimed, w.replied, w.acted]),
    },
    {
      title: "Sentiment per day",
      header: ["Day", "Positive", "Neutral", "Negative"],
      rows: result.sentimentTrend.map((d) => [d.day, d.positive, d.neutral, d.negative]),
    },
    { title: "Urgency", header: ["Urgency", "Mails"], rows: result.urgency.map((u) => [u.name, u.value]) },
    { title: "Sentiment", header: ["Sentiment", "Mails"], rows: result.sentiment.map((u) => [u.name, u.value]) },
    { title: "Top senders", header: ["Sender", "Mails"], rows: result.topSenders.map((u) => [u.name, u.value]) },
    { title: "Business units", header: ["Business unit", "Mails"], rows: result.topBusinessUnits.map((u) => [u.name, u.value]) },
    { title: "Countries", header: ["Country", "Mails"], rows: result.topCountries.map((u) => [u.name, u.value]) },
    {
      title: "Recurring topics",
      header: ["Topic", "Mails", "Change %", "Example mails"],
      rows: result.topics.map((u) => [u.name, u.value, u.change ?? "new", (u.examples ?? []).map((e) => e.subject).join(" / ")]),
    },
    {
      title: "AI quality",
      header: ["Measure", "Percent"],
      rows: [
        ["Sorted by the AI", result.ai.autoSortedPct],
        ["Corrected by people", result.ai.overriddenPct],
        ["Needs review", result.ai.needsReviewPct],
      ],
    },
  ];
}

const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function toCsv(tables: ExportTable[], heading: string) {
  const blocks = tables.map((table) =>
    [
      table.title,
      ...(table.note ? [csvCell(table.note)] : []),
      ...(table.header.length ? [table.header.map(csvCell).join(",")] : []),
      ...table.rows.map((row) => row.map(csvCell).join(",")),
      "",
    ].join("\n"),
  );
  // The BOM makes Excel read the file as UTF-8.
  return "﻿" + [heading + "\n", ...blocks].join("\n");
}

/** A real .xlsx: one sheet with a block per table, bold headers and sized columns. */
async function toExcel(tables: ExportTable[], heading: string) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mailbox Agent";
  const sheet = workbook.addWorksheet("Dashboard");
  sheet.addRow([heading]).font = { bold: true, size: 14 };
  sheet.addRow([]);
  for (const table of tables) {
    sheet.addRow([table.title]).font = { bold: true, size: 12, color: { argb: "FFE3000F" } };
    if (table.note) {
      const noteRow = sheet.addRow([table.note]);
      sheet.mergeCells(noteRow.number, 1, noteRow.number, 4);
      noteRow.alignment = { wrapText: true, vertical: "top" };
      noteRow.height = 64;
    }
    if (table.header.length) {
      const header = sheet.addRow(table.header);
      header.font = { bold: true };
      header.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDEDED" } };
      });
    }
    table.rows.forEach((row) => sheet.addRow(row));
    sheet.addRow([]);
  }
  sheet.columns = [{ width: 34 }, { width: 16 }, { width: 16 }, { width: 60 }];
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

/** A real PDF with the same tables, laid out in two columns of text rows across A4 pages. */
async function toPdf(tables: ExportTable[], heading: string) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const [pageWidth, pageHeight, margin] = [595, 842, 40];
  const dark = rgb(0.11, 0.11, 0.12);
  const red = rgb(0.89, 0, 0.06);

  let page: PDFPage = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  const newPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };
  const ensure = (height: number) => {
    if (y - height < margin) newPage();
  };
  const fit = (text: string, font: PDFFont, size: number, width: number) => {
    let out = text;
    while (out.length > 1 && font.widthOfTextAtSize(out, size) > width) out = out.slice(0, -2);
    return out === text ? text : out.trimEnd() + "…";
  };

  const wrap = (text: string, font: PDFFont, size: number, width: number) => {
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(/s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > width && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  };

  page.drawText(heading, { x: margin, y: y - 14, size: 16, font: bold, color: dark });
  y -= 40;

  for (const table of tables) {
    ensure(60);
    page.drawText(table.title, { x: margin, y: y - 11, size: 12, font: bold, color: red });
    y -= 22;
    if (table.note) {
      for (const line of wrap(table.note, regular, 10, pageWidth - margin * 2)) {
        ensure(15);
        page.drawText(line, { x: margin, y: y - 10, size: 10, font: regular, color: dark });
        y -= 15;
      }
    }
    const columnWidth = (pageWidth - margin * 2) / Math.max(table.header.length, 1);
    ensure(18);
    if (table.header.length) y += 0;
    table.header.forEach((label, index) => {
      page.drawText(fit(label, bold, 9, columnWidth - 8), { x: margin + index * columnWidth, y: y - 9, size: 9, font: bold, color: dark });
    });
    if (table.header.length) y -= 16;
    for (const row of table.rows) {
      ensure(16);
      row.forEach((value, index) => {
        page.drawText(fit(String(value), regular, 9, columnWidth - 8), { x: margin + index * columnWidth, y: y - 9, size: 9, font: regular, color: dark });
      });
      page.drawLine({ start: { x: margin, y: y - 13 }, end: { x: pageWidth - margin, y: y - 13 }, thickness: 0.4, color: rgb(0.9, 0.9, 0.9) });
      y -= 15;
    }
    y -= 14;
  }
  return Buffer.from(await pdf.save());
}

/** The dashboard as a download in the chosen format (DB-13). */
export async function dashboardExportResponse(result: DashboardResponse, days: number, format: ExportFormat) {
  const tables = buildTables(result);
  const heading = `Mailbox dashboard - last ${days} days`;
  const name = `mailbox-dashboard-${days}d`;

  if (format === "xlsx") {
    return new NextResponse(new Uint8Array(await toExcel(tables, heading)), {
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="${name}.xlsx"`,
      },
    });
  }
  if (format === "pdf") {
    return new NextResponse(new Uint8Array(await toPdf(tables, heading)), {
      headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${name}.pdf"` },
    });
  }
  return new NextResponse(toCsv(tables, heading), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}.csv"` },
  });
}
