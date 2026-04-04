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
import { hrmsService, normalizeHrmsError } from "@/services/hrms";
import type {
  SalaryTemplateCreateDTO,
  SalaryTemplateResponseDTO,
  SalaryTemplateUpdateDTO,
} from "@/services/types/hrms";

const currentYear = new Date().getFullYear();

const initialForm: SalaryTemplateCreateDTO = {
  templateName: "",
  description: "",
  gradeId: undefined,
  academicYear: `${currentYear}-${currentYear + 1}`,
  components: [],
};

export default function SalaryTemplateBuilder() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryTemplateResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalaryTemplateResponseDTO | null>(null);
  const [form, setForm] = useState<SalaryTemplateCreateDTO>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["hrms", "salary", "templates"],
    queryFn: () => hrmsService.listSalaryTemplates().then((res) => res.data),
  });

  const gradesQuery = useQuery({
    queryKey: ["hrms", "grades"],
    queryFn: () => hrmsService.listGrades().then((res) => res.data),
  });

  const componentsQuery = useQuery({
    queryKey: ["hrms", "salary", "components"],
    queryFn: () => hrmsService.listSalaryComponents().then((res) => res.data),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["hrms", "salary", "templates"] });

  const createMutation = useMutation({
    mutationFn: (payload: SalaryTemplateCreateDTO) => hrmsService.createSalaryTemplate(payload),
    onSuccess: () => {
      toast.success("Template created");
      closeForm();
      refresh();
    },
    onError: (err) => {
      const normalized = normalizeHrmsError(err);
      setFieldErrors(normalized.fieldErrors ?? {});
      toast.error(normalized.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SalaryTemplateUpdateDTO }) =>
      hrmsService.updateSalaryTemplate(id, payload),
    onSuccess: () => {
      toast.success("Template updated");
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
    mutationFn: (id: number) => hrmsService.deleteSalaryTemplate(id),
    onSuccess: () => {
      toast.success("Template deleted");
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

  const openEdit = (row: SalaryTemplateResponseDTO) => {
    setEditing(row);
    setForm({
      templateName: row.templateName,
      description: row.description,
      gradeId: row.gradeId,
      academicYear: row.academicYear,
      components: row.components.map((c) => ({ componentId: c.componentId, value: c.value })),
    });
    setFieldErrors({});
    setFormOpen(true);
  };

  const updateComponentValue = (componentId: number, value: number) => {
    setForm((prev) => {
      const existing = prev.components.find((c) => c.componentId === componentId);
      if (existing) {
        return {
          ...prev,
          components: prev.components.map((c) =>
            c.componentId === componentId ? { ...c, value } : c,
          ),
        };
      }
      return { ...prev, components: [...prev.components, { componentId, value }] };
    });
  };

  const submit = () => {
    if (editing) {
      updateMutation.mutate({
        id: editing.templateId,
        payload: {
          templateName: form.templateName,
          description: form.description,
          gradeId: form.gradeId,
          academicYear: form.academicYear,
          components: form.components,
        },
      });
      return;
    }
    createMutation.mutate(form);
  };

  const rows = data ?? [];

  const columns = useMemo<Column<SalaryTemplateResponseDTO>[]>(
    () => [
      { key: "templateName", header: "Template", searchable: true },
      { key: "gradeName", header: "Grade", render: (row) => row.gradeName ?? "-" },
      { key: "academicYear", header: "Year" },
      {
        key: "components",
        header: "Components",
        render: (row) => row.components.length,
      },
      {
        key: "active",
        header: "Status",
        render: (row) => (
          <Badge variant={row.active ? "default" : "secondary"}>
            {row.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    [],
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
        <h3 className="text-base font-semibold">Salary Templates</h3>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Template
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.templateId}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        emptyMessage={isLoading ? "Loading salary templates..." : "No salary templates found."}
      />

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              Templates bundle salary components for assignment to staff.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tpl-name">Template Name</Label>
              <Input
                id="tpl-name"
                value={form.templateName}
                onChange={(e) => setForm((p) => ({ ...p, templateName: e.target.value }))}
              />
              {fieldErrors.templateName?.[0] && <p className="text-xs text-destructive">{fieldErrors.templateName[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Grade (optional)</Label>
                <Select
                  value={form.gradeId ? String(form.gradeId) : "none"}
                  onValueChange={(v) => setForm((p) => ({ ...p, gradeId: v === "none" ? undefined : Number(v) }))}
                >
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {(gradesQuery.data ?? []).map((g) => (
                      <SelectItem key={g.gradeId} value={String(g.gradeId)}>
                        {g.gradeCode} — {g.gradeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tpl-year">Academic Year</Label>
                <Input
                  id="tpl-year"
                  value={form.academicYear}
                  onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))}
                  placeholder="2025-2026"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tpl-desc">Description</Label>
              <Textarea
                id="tpl-desc"
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            {/* Component Values */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Component Values</p>
              {(componentsQuery.data ?? []).map((comp) => {
                const existing = form.components.find((c) => c.componentId === comp.componentId);
                return (
                  <div key={comp.componentId} className="flex items-center gap-3 rounded border px-3 py-2">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{comp.componentName}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({comp.type} / {comp.calculationMethod.replace(/_/g, " ")})
                      </span>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      className="w-[120px]"
                      value={existing?.value ?? ""}
                      onChange={(e) => updateComponentValue(comp.componentId, Number(e.target.value || 0))}
                      placeholder={String(comp.defaultValue)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
            <Button
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending || !form.templateName}
            >
              {editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete salary template?"
        description={`This will remove ${deleteTarget?.templateName ?? "this template"}.`}
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.templateId); }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
