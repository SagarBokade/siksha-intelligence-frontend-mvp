import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHrmsFormatters } from "@/features/hrms/hooks/useHrmsFormatters";
import { hrmsService, normalizeHrmsError } from "@/services/hrms";

interface SalaryOverrideEditorProps {
  selectedMappingId?: number;
}

export default function SalaryOverrideEditor({ selectedMappingId }: SalaryOverrideEditorProps) {
  const { formatCurrency } = useHrmsFormatters();
  const [mappingIdInput, setMappingIdInput] = useState<string>(
    selectedMappingId ? String(selectedMappingId) : "",
  );
  const mappingId = Number(mappingIdInput);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["hrms", "salary", "computed", mappingId],
    queryFn: () => hrmsService.getComputedSalary(mappingId).then((res) => res.data),
    enabled: Number.isFinite(mappingId) && mappingId > 0,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Computed Salary Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:max-w-xs">
          <Label htmlFor="override-mapping-id">Mapping ID</Label>
          <Input
            id="override-mapping-id"
            type="number"
            min={1}
            value={mappingIdInput}
            onChange={(e) => setMappingIdInput(e.target.value)}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={!Number.isFinite(mappingId) || mappingId <= 0}
          onClick={() => refetch()}
        >
          Refresh Computed Preview
        </Button>

        {isError && (
          <div className="space-y-2 rounded-lg border border-destructive/30 p-3">
            <p className="text-sm text-destructive">{normalizeHrmsError(error).message}</p>
          </div>
        )}

        {data && (
          <>
            {/* Staff Info */}
            <div className="grid gap-1 text-sm">
              <p>Staff: <span className="font-semibold">{data.staffName}</span> ({data.employeeId})</p>
              <p>Template: <span className="font-semibold">{data.templateName}</span></p>
              {data.gradeCode && <p>Grade: <span className="font-semibold">{data.gradeCode}</span></p>}
              {data.hasOverrides && <Badge variant="outline">Has Override(s)</Badge>}
            </div>

            {/* Summary */}
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <p>Gross Pay: <span className="font-semibold">{formatCurrency(data.grossPay)}</span></p>
              <p>Total Deductions: <span className="font-semibold">{formatCurrency(data.totalDeductions)}</span></p>
              <p>Net Pay: <span className="font-semibold">{formatCurrency(data.netPay)}</span></p>
              <p>CTC: <span className="font-semibold">{formatCurrency(data.ctc)}</span></p>
            </div>

            {/* Earnings */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Earnings</p>
              {data.earnings.map((item) => (
                <div key={item.componentCode} className="flex items-center justify-between rounded border px-3 py-1.5 text-sm">
                  <span>
                    {item.componentName}
                    {item.isOverridden && <Badge variant="outline" className="ml-2">Overridden</Badge>}
                    {item.isStatutory && <Badge variant="outline" className="ml-1">🏛️</Badge>}
                  </span>
                  <span className="font-semibold">{formatCurrency(item.computedAmount)}</span>
                </div>
              ))}
            </div>

            {/* Deductions */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Deductions</p>
              {data.deductions.map((item) => (
                <div key={item.componentCode} className="flex items-center justify-between rounded border px-3 py-1.5 text-sm">
                  <span>
                    {item.componentName}
                    {item.isOverridden && <Badge variant="outline" className="ml-2">Overridden</Badge>}
                    {item.isStatutory && <Badge variant="outline" className="ml-1">🏛️</Badge>}
                  </span>
                  <span className="font-semibold text-destructive">−{formatCurrency(item.computedAmount)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {!data && !isLoading && !isError && (
          <p className="text-sm text-muted-foreground">Enter a mapping ID and click refresh to see computed breakdown.</p>
        )}

        <p className="text-xs text-muted-foreground">
          Preview is sourced from <code>/salary/mappings/{"{mappingId}"}/computed</code>. All calculations are backend-authoritative.
        </p>
      </CardContent>
    </Card>
  );
}
