import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PayslipViewer from "@/features/hrms/PayslipViewer";
import { useHrmsFormatters } from "@/features/hrms/hooks/useHrmsFormatters";
import { triggerBlobDownload } from "@/services/idCard";
import { hrmsService, normalizeHrmsError } from "@/services/hrms";
import type { PayslipSummaryDTO } from "@/services/types/hrms";

export default function PayslipTable() {
  const { formatCurrency } = useHrmsFormatters();
  const [viewerPayslipId, setViewerPayslipId] = useState<number | null>(null);
  const [runIdFilter, setRunIdFilter] = useState<string>("");
  const runId = Number(runIdFilter);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["hrms", "payroll", "payslips", runId || "all"],
    queryFn: () => {
      if (runId > 0) {
        return hrmsService.listPayslipsByRun(runId, { page: 0, size: 100 }).then((res) => res.data);
      }
      // If no run ID, list from most recent runs
      return hrmsService.listPayrollRuns({ page: 0, size: 1, sort: ["payYear,desc", "payMonth,desc"] }).then((res) => {
        const latestRun = res.data.content?.[0];
        if (!latestRun) return { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, first: true, last: true, numberOfElements: 0, empty: true };
        return hrmsService.listPayslipsByRun(latestRun.runId, { page: 0, size: 100 }).then((r) => r.data);
      });
    },
  });

  const downloadPayslip = async (row: PayslipSummaryDTO) => {
    try {
      const response = await hrmsService.downloadPayslipPdf(row.payslipId);
      triggerBlobDownload(response.data, `payslip-${row.payYear}-${String(row.payMonth).padStart(2, "0")}-${row.staffName}.pdf`);
    } catch (downloadError) {
      toast.error(normalizeHrmsError(downloadError).message);
    }
  };

  const columns = useMemo<Column<PayslipSummaryDTO>[]>(
    () => [
      { key: "payslipId", header: "ID", searchable: true },
      { key: "staffName", header: "Staff", searchable: true },
      { key: "employeeId", header: "Employee ID", searchable: true },
      {
        key: "period",
        header: "Period",
        render: (row) => `${String(row.payMonth).padStart(2, "0")}/${row.payYear}`,
      },
      { key: "netPay", header: "Net Pay", render: (row) => formatCurrency(row.netPay) },
      {
        key: "status",
        header: "Status",
        render: (row) => <Badge variant={row.status === "DISBURSED" ? "default" : "secondary"}>{row.status}</Badge>,
      },
      {
        key: "viewer",
        header: "View",
        render: (row) => (
          <Button size="sm" variant="outline" onClick={() => setViewerPayslipId(row.payslipId)}>
            View
          </Button>
        ),
      },
      {
        key: "download",
        header: "PDF",
        render: (row) => (
          <Button size="sm" variant="outline" onClick={() => void downloadPayslip(row)}>
            Download
          </Button>
        ),
      },
    ],
    [formatCurrency],
  );

  if (isError) {
    return (
      <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
        <p className="text-sm text-destructive">{normalizeHrmsError(error).message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="grid gap-2">
          <Label htmlFor="payslip-run-filter">Filter by Run ID</Label>
          <Input
            id="payslip-run-filter"
            type="number"
            min={1}
            className="w-[140px]"
            value={runIdFilter}
            onChange={(e) => setRunIdFilter(e.target.value)}
            placeholder="Latest"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        getRowId={(row) => row.payslipId}
        emptyMessage={isLoading ? "Loading payslips..." : "No payslips found."}
      />

      <PayslipViewer
        payslipId={viewerPayslipId}
        open={Boolean(viewerPayslipId)}
        onOpenChange={(open) => { if (!open) setViewerPayslipId(null); }}
      />
    </div>
  );
}
