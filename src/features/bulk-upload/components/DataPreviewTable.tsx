import { motion } from "framer-motion";
import type { DataPreviewTableProps } from "../types";

export default function DataPreviewTable({ data }: DataPreviewTableProps) {
  const { headers, rows } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full space-y-3"
    >
      {/* ── Row count badge ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Data Preview</p>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {rows.length} {rows.length === 1 ? "row" : "rows"}
        </span>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="max-h-[420px] overflow-auto rounded-lg border border-border">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
              {/* Row # column */}
              <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                #
              </th>
              {headers.map((header, i) => (
                <th
                  key={`h-${i}`}
                  className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={`r-${rowIdx}`}
                className="border-b border-border/50 transition-colors hover:bg-accent/40"
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs font-medium text-muted-foreground">
                  {rowIdx + 1}
                </td>
                {headers.map((_, colIdx) => (
                  <td
                    key={`c-${rowIdx}-${colIdx}`}
                    className="max-w-[250px] truncate px-4 py-2 text-foreground"
                  >
                    {row[colIdx] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
