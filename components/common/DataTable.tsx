import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TableColumn<Row> {
  id: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Centre the content and remove padding, for checkbox columns. */
  narrow?: boolean;
}

interface DataTableProps<Row> {
  columns: TableColumn<Row>[];
  /** CSS grid-template-columns, one entry per column. */
  gridColumns: string;
  rows: Row[];
  getRowId: (row: Row) => string;
  /** Tailwind border-left colour class for one row (the urgency bar). */
  getRowAccentClass?: (row: Row) => string;
  /** Smallest width before the table scrolls sideways. */
  minWidth?: number;
}

/** Table with column dividers, a grey header, zebra rows and a coloured left edge. */
export default function DataTable<Row>({
  columns,
  gridColumns,
  rows,
  getRowId,
  getRowAccentClass,
  minWidth = 1140,
}: DataTableProps<Row>) {
  return (
    <div className="overflow-x-auto border-t border-line-strong" role="table">
      <div style={{ minWidth }}>
        <div
          role="row"
          className="grid border-b-2 border-l-[3px] border-line-strong border-l-table-head bg-table-head"
          style={{ gridTemplateColumns: gridColumns }}
        >
          {columns.map((column, index) => (
            <div
              key={column.id}
              role="columnheader"
              className={cn(
                "flex h-10 min-w-0 items-center border-r border-line-col text-[11px] font-bold uppercase tracking-[0.07em] text-ink-head",
                column.narrow ? "justify-center" : "px-3",
                index === columns.length - 1 && "border-r-0",
              )}
            >
              {column.header}
            </div>
          ))}
        </div>

        {rows.map((row, rowIndex) => (
          <div
            key={getRowId(row)}
            role="row"
            className={cn(
              "grid min-h-[58px] items-stretch border-b border-l-[3px] border-line transition-colors duration-150 ease-out hover:bg-[#eef1f5] has-checked:bg-brand-tint-soft",
              rowIndex % 2 === 0 ? "bg-card" : "bg-stripe",
              getRowAccentClass?.(row),
            )}
            style={{ gridTemplateColumns: gridColumns }}
          >
            {columns.map((column, index) => (
              <div
                key={column.id}
                role="cell"
                className={cn(
                  "flex min-w-0 items-center border-r border-line",
                  column.narrow ? "justify-center" : "px-3 py-2",
                  index === columns.length - 1 && "gap-1.5 border-r-0",
                )}
              >
                {column.cell(row)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
