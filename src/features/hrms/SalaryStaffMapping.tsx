import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataTable, { type Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import SalaryOverrideEditor from "@/features/hrms/SalaryOverrideEditor";
import { useHrmsFormatters } from "@/features/hrms/hooks/useHrmsFormatters";
import { hrmsService, normalizeHrmsError } from "@/services/hrms";
import type { StaffSalaryMappingCreateDTO, StaffSalaryMappingResponseDTO } from "@/services/types/hrms";

const todayIso = new Date().toISOString().slice(0, 10);

const initialForm: StaffSalaryMappingCreateDTO = {
  staffId: 0,
  templateId: 0,
  effectiveFrom: todayIso,
  effectiveTo: undefined,
  remarks: "",
  overrides: [],
};

export default function SalaryStaffMapping() {
  const queryClient = useQueryClient();
  const { formatCurrency, formatDate } = useHrmsFormatters();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffSalaryMappingResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffSalaryMappingResponseDTO | null>(null);
  const [previewTarget, setPreviewTarget] = useState<StaffSalaryMappingResponseDTO | null>(null);
  const [form, setForm] = useState<StaffSalaryMappingCreateDTO>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["hrms", "salary", "mappings"],
    queryFn: () =>
      hrmsService
        .listSalaryMappings({ page: 0, size: 100, sort: ["effectiveFrom,desc"] })
        .then((res) => res.data),
  });

  const templatesQuery = useQuery({
    queryKey: ["hrms", "salary", "templates"],
    queryFn: () => hrmsService.listSalaryTemplates().then((res) => res.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["hrms", "salary", "mappings"] });

  const saveMutation = useMutation({
    mutationFn: (payload: StaffSalaryMappingCreateDTO) =>
      editing
        ? hrmsService.updateSalaryMapping(editing.mappingId, payload)
        : hrmsService.createSalaryMapping(payload),
    onSuccess: () => {
      toast.success(editing ? "Mapping updated" : "Mapping created");
      closeForm();
      refresh();
    },
    onError: (err) => {
      const normalized = normalizeHrmsError(err);
      setFieldErrors(normalized.fieldErrors ?? {});
      toast.error(normalized.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => hrmsService.updateSalaryMapping(id, { staffId: 0, templateId: 0, effectiveFrom: "" }),
    onSuccess: () => {
      toast.success("Mapping deleted");
      setDeleteTarget(null);
      refresh();
    },
    onError: (err) => toast.error(normalizeHrmsError(err).message),
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(initialForm);
    setFieldErrors({});
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFieldErrors({});
    setFormOpen(true);
  };

  const openEdit = (row: StaffSalaryMappingResponseDTO) => {
    setEditing(row);
    setForm({
      staffId: row.staffId,
      templateId: row.templateId,
      effectiveFrom: row.effectiveFrom,
      effectiveTo: row.effectiveTo,
      remarks: row.remarks ?? "",
      overrides: row.overrides?.map((o) => ({
        componentId: o.componentId,
        overrideValue: o.overrideValue,
        reason: o.reason,
      })) ?? [],
    });
    setFieldErrors({});
    setFormOpen(true);
  };

  const rows = data?.content ?? [];

  const columns = useMemo<Column<StaffSalaryMappingResponseDTO>[]>(
    () => [
      { key: "mappingId", header: "ID", searchable: true },
      { key: "staffName", header: "Staff", searchable: true },
      { key: "employeeId", header: "Emp. ID", searchable: true },
      { key: "templateName", header: "Template", searchable: true },
      { key: "gradeCode", header: "Grade", render: (row) => row.gradeCode ?? "-" },
      { key: "ctc", header: "CTC", render: (row) => formatCurrency(row.ctc) },
      { key: "netPay", header: "Net Pay", render: (row) => formatCurrency(row.netPay) },
      {
        key: "effectiveFrom",
        header: "Effective",
        render: (row) => formatDate(row.effectiveFrom),
      },
      {
        key: "overrides",
        header: "Overrides",
        render: (row) =>
          row.hasOverrides ? (
            <Badge variant="outline">{(row.overrides?.length ?? 0)} overrides</Badge>
          ) : (
            "-"
          ),
      },
      {
        key: "computed",
        header: "Preview",
        render: (row) => (
          <Button size="sm" variant="outline" onClick={() => setPreviewTarget(row)}>
            Preview
          </Button>
        ),
      },
    ],
    [formatCurrency, formatDate],
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
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Salary Staff Mapping</h3>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Mapping
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.mappingId}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        emptyMessage={isLoading ? "Loading salary mappings..." : "No salary mappings found."}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Salary Mapping" : "Create Salary Mapping"}</DialogTitle>
            <DialogDescription>
              Always validate mapping with computed preview before confirmation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="map-staff-id">Staff ID</Label>
              <Input
                id="map-staff-id"
                type="number"
                min={1}
                value={form.staffId || ""}
                onChange={(e) => setForm((p) => ({ ...p, staffId: Number(e.target.value || 0) }))}
              />
              {fieldErrors.staffId?.[0] && <p className="text-xs text-destructive">{fieldErrors.staffId[0]}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Template</Label>
              <Select
                value={form.templateId ? String(form.templateId) : undefined}
                onValueChange={(v) => setForm((p) => ({ ...p, templateId: Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>
                  {(templatesQuery.data ?? []).map((t) => (
                    <SelectItem key={t.templateId} value={String(t.templateId)}>
                      {t.templateName} {t.gradeName ? `(${t.gradeName})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.templateId?.[0] && <p className="text-xs text-destructive">{fieldErrors.templateId[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="map-from">Effective From</Label>
                <Input
                  id="map-from"
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm((p) => ({ ...p, effectiveFrom: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="map-to">Effective To (optional)</Label>
                <Input
                  id="map-to"
                  type="date"
                  value={form.effectiveTo ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, effectiveTo: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="map-remarks">Remarks</Label>
              <Textarea
                id="map-remarks"
                value={form.remarks ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                placeholder="Reason for mapping / seniority override"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending || !form.staffId || !form.templateId || !form.effectiveFrom}
            >
              {editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete salary mapping?"
        description={`This will remove mapping for ${deleteTarget?.staffName ?? "staff"} #${deleteTarget?.mappingId ?? ""}.`}
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.mappingId); }}
        loading={deleteMutation.isPending}
      />

      {previewTarget && <SalaryOverrideEditor selectedMappingId={previewTarget.mappingId} />}
    </div>
  );
}
