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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useHrmsFormatters } from "@/features/hrms/hooks/useHrmsFormatters";
import { hrmsService, normalizeHrmsError } from "@/services/hrms";
import type {
  LeaveApplicationCreateDTO,
  LeaveApplicationResponseDTO,
  LeaveReviewDTO,
  LeaveStatus,
} from "@/services/types/hrms";

const initialApplyForm: LeaveApplicationCreateDTO = {
  leaveTypeId: 0,
  fromDate: "",
  toDate: "",
  isHalfDay: false,
  halfDayType: undefined,
  reason: "",
  attachmentUrl: "",
};

type LeaveAction = "approve" | "reject" | "cancel";

const statusOptions: Array<"ALL" | LeaveStatus> = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

const statusColor: Record<LeaveStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  APPROVED: "default",
  REJECTED: "destructive",
  CANCELLED: "secondary",
};

export default function LeaveManagement() {
  const queryClient = useQueryClient();
  const { formatDate } = useHrmsFormatters();
  const [status, setStatus] = useState<"ALL" | LeaveStatus>("ALL");
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState<LeaveApplicationCreateDTO>(initialApplyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [actionTarget, setActionTarget] = useState<{
    row: LeaveApplicationResponseDTO;
    action: LeaveAction;
  } | null>(null);
  const [remarks, setRemarks] = useState("");

  const leaveTypesQuery = useQuery({
    queryKey: ["hrms", "leave-types"],
    queryFn: () => hrmsService.listLeaveTypes().then((res) => res.data),
  });

  const leavesQuery = useQuery({
    queryKey: ["hrms", "leaves", status],
    queryFn: () =>
      hrmsService
        .listLeaveApplications({
          page: 0,
          size: 100,
          sort: ["appliedOn,desc"],
          status: status === "ALL" ? undefined : status,
        })
        .then((res) => res.data),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["hrms", "leaves"] });
    queryClient.invalidateQueries({ queryKey: ["hrms", "leave-balances"] });
  };

  const applyMutation = useMutation({
    mutationFn: (payload: LeaveApplicationCreateDTO) => hrmsService.applyLeave(payload),
    onSuccess: () => {
      toast.success("Leave application submitted");
      setApplyOpen(false);
      setApplyForm(initialApplyForm);
      setFieldErrors({});
      refresh();
    },
    onError: (error) => {
      const normalized = normalizeHrmsError(error);
      setFieldErrors(normalized.fieldErrors ?? {});
      toast.error(normalized.message);
    },
  });

  const actionMutation = useMutation({
    mutationFn: ({
      applicationId,
      action,
      payload,
    }: {
      applicationId: number;
      action: LeaveAction;
      payload?: LeaveReviewDTO;
    }) => {
      if (action === "approve") return hrmsService.approveLeave(applicationId, payload);
      if (action === "reject") return hrmsService.rejectLeave(applicationId, payload);
      return hrmsService.cancelLeave(applicationId, payload);
    },
    onSuccess: (_, vars) => {
      const label: Record<LeaveAction, string> = {
        approve: "approved",
        reject: "rejected",
        cancel: "cancelled",
      };
      toast.success(`Leave ${label[vars.action]} successfully`);
      setActionTarget(null);
      setRemarks("");
      refresh();
    },
    onError: (error) => toast.error(normalizeHrmsError(error).message),
  });

  const rows = leavesQuery.data?.content ?? [];

  const columns = useMemo<Column<LeaveApplicationResponseDTO>[]>(
    () => [
      { key: "staffName", header: "Staff", searchable: true },
      {
        key: "leaveType",
        header: "Leave Type",
        render: (row) => `${row.leaveTypeName} (${row.leaveTypeCode})`,
        searchable: true,
      },
      {
        key: "fromDate",
        header: "From",
        render: (row) => formatDate(row.fromDate),
      },
      {
        key: "toDate",
        header: "To",
        render: (row) => formatDate(row.toDate),
      },
      {
        key: "totalDays",
        header: "Days",
        render: (row) => {
          const suffix = row.isHalfDay ? ` (${row.halfDayType === "FIRST_HALF" ? "1st" : "2nd"} half)` : "";
          return `${row.totalDays}${suffix}`;
        },
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <Badge variant={statusColor[row.status] ?? "secondary"}>{row.status}</Badge>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        render: (row) => <span className="max-w-[200px] truncate block">{row.reason || "-"}</span>,
      },
      {
        key: "workflow",
        header: "Actions",
        render: (row) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={row.status !== "PENDING"}
              onClick={() => setActionTarget({ row, action: "approve" })}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={row.status !== "PENDING"}
              onClick={() => setActionTarget({ row, action: "reject" })}
            >
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={row.status !== "APPROVED" && row.status !== "PENDING"}
              onClick={() => setActionTarget({ row, action: "cancel" })}
            >
              Cancel
            </Button>
          </div>
        ),
      },
    ],
    [formatDate],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Leave Management</h3>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "ALL" | LeaveStatus)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={() => {
              setApplyForm(initialApplyForm);
              setFieldErrors({});
              setApplyOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Apply Leave
          </Button>
        </div>
      </div>

      {(leavesQuery.isError || leaveTypesQuery.isError) && (
        <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
          <p className="text-sm text-destructive">
            {leavesQuery.isError
              ? normalizeHrmsError(leavesQuery.error).message
              : normalizeHrmsError(leaveTypesQuery.error).message}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void leavesQuery.refetch();
              void leaveTypesQuery.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.applicationId}
        emptyMessage={leavesQuery.isLoading ? "Loading leaves..." : "No leave requests found."}
      />

      {/* Apply Leave Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Leave</DialogTitle>
            <DialogDescription>Submit a leave request for approval workflow.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Leave Type</Label>
              <Select
                value={applyForm.leaveTypeId ? String(applyForm.leaveTypeId) : undefined}
                onValueChange={(value) =>
                  setApplyForm((prev) => ({ ...prev, leaveTypeId: Number(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {(leaveTypesQuery.data ?? []).map((type) => (
                    <SelectItem key={type.leaveTypeId} value={String(type.leaveTypeId)}>
                      {type.displayName} ({type.leaveCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.leaveTypeId?.[0] && (
                <p className="text-xs text-destructive">{fieldErrors.leaveTypeId[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="leave-from">From Date</Label>
                <Input
                  id="leave-from"
                  type="date"
                  value={applyForm.fromDate}
                  onChange={(e) =>
                    setApplyForm((prev) => ({ ...prev, fromDate: e.target.value }))
                  }
                />
                {fieldErrors.fromDate?.[0] && (
                  <p className="text-xs text-destructive">{fieldErrors.fromDate[0]}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leave-to">To Date</Label>
                <Input
                  id="leave-to"
                  type="date"
                  value={applyForm.toDate}
                  onChange={(e) =>
                    setApplyForm((prev) => ({ ...prev, toDate: e.target.value }))
                  }
                />
                {fieldErrors.toDate?.[0] && (
                  <p className="text-xs text-destructive">{fieldErrors.toDate[0]}</p>
                )}
              </div>
            </div>

            {/* Half-day toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="leave-half"
                  checked={applyForm.isHalfDay ?? false}
                  onCheckedChange={(checked) =>
                    setApplyForm((prev) => ({
                      ...prev,
                      isHalfDay: checked,
                      halfDayType: checked ? "FIRST_HALF" : undefined,
                    }))
                  }
                />
                <Label htmlFor="leave-half">Half Day</Label>
              </div>
              {applyForm.isHalfDay && (
                <Select
                  value={applyForm.halfDayType ?? "FIRST_HALF"}
                  onValueChange={(value) =>
                    setApplyForm((prev) => ({
                      ...prev,
                      halfDayType: value as "FIRST_HALF" | "SECOND_HALF",
                    }))
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIRST_HALF">First Half</SelectItem>
                    <SelectItem value="SECOND_HALF">Second Half</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="leave-reason">Reason</Label>
              <Textarea
                id="leave-reason"
                value={applyForm.reason ?? ""}
                maxLength={500}
                onChange={(e) =>
                  setApplyForm((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
              {fieldErrors.reason?.[0] && (
                <p className="text-xs text-destructive">{fieldErrors.reason[0]}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="leave-attachment">Attachment URL (optional)</Label>
              <Input
                id="leave-attachment"
                value={applyForm.attachmentUrl ?? ""}
                onChange={(e) =>
                  setApplyForm((prev) => ({ ...prev, attachmentUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button
              disabled={
                applyMutation.isPending ||
                !applyForm.leaveTypeId ||
                !applyForm.fromDate ||
                !applyForm.toDate ||
                !applyForm.reason
              }
              onClick={() => applyMutation.mutate(applyForm)}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve / Reject / Cancel Confirm */}
      <ConfirmDialog
        open={Boolean(actionTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setActionTarget(null);
            setRemarks("");
          }
        }}
        title={
          actionTarget
            ? `${actionTarget.action.charAt(0).toUpperCase() + actionTarget.action.slice(1)} Leave?`
            : "Leave Action"
        }
        description={
          actionTarget
            ? `${actionTarget.action.toUpperCase()} leave for ${actionTarget.row.staffName} (${actionTarget.row.leaveTypeName}, ${actionTarget.row.totalDays} days)`
            : "Confirm leave action"
        }
        confirmLabel={actionTarget ? actionTarget.action.toUpperCase() : "Confirm"}
        onConfirm={() => {
          if (!actionTarget) return;
          actionMutation.mutate({
            applicationId: actionTarget.row.applicationId,
            action: actionTarget.action,
            payload: remarks ? { remarks } : undefined,
          });
        }}
        loading={actionMutation.isPending}
      >
        <div className="space-y-2 pt-2">
          <Label htmlFor="leave-action-remarks">Reviewer Remarks (optional)</Label>
          <Textarea
            id="leave-action-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add reviewer remarks"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
