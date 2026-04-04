import axios from "axios";
import { api } from "@/lib/axios";
import type { MessageResponse, PageResponse } from "./types/common";
import type {
  CalendarEventCreateDTO,
  CalendarEventResponseDTO,
  CalendarSummaryDTO,
  ComputedSalaryBreakdownDTO,
  HrmsApiErrorResponse,
  HrmsDashboardSummaryDTO,
  HrmsListParams,
  LeaveApplicationCreateDTO,
  LeaveApplicationResponseDTO,
  LeaveBalanceInitializeDTO,
  LeaveBalanceResponseDTO,
  LeaveReviewDTO,
  LeaveTypeConfigCreateUpdateDTO,
  LeaveTypeConfigResponseDTO,
  PayrollRunCreateDTO,
  PayrollRunResponseDTO,
  PayslipDetailDTO,
  PayslipSummaryDTO,
  SalaryComponentCreateUpdateDTO,
  SalaryComponentResponseDTO,
  SalaryTemplateCreateDTO,
  SalaryTemplateResponseDTO,
  SalaryTemplateUpdateDTO,
  StaffAttendanceSummaryDTO,
  StaffGradeAssignDTO,
  StaffGradeAssignmentResponseDTO,
  StaffGradeCreateUpdateDTO,
  StaffGradeResponseDTO,
  StaffSalaryMappingCreateDTO,
  StaffSalaryMappingResponseDTO,
} from "./types/hrms";

const HRMS = "/auth/hrms";

// ── Error normalizer ─────────────────────────────────────────────────

export interface NormalizedHrmsError {
  message: string;
  fieldErrors?: Record<string, string[]>;
}

function toStringArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

export function normalizeHrmsError(error: unknown): NormalizedHrmsError {
  if (!axios.isAxiosError(error)) {
    return { message: "Unexpected error occurred" };
  }
  const data = error.response?.data as HrmsApiErrorResponse | undefined;
  const fieldErrors = data?.fieldErrors
    ? Object.entries(data.fieldErrors).reduce<Record<string, string[]>>(
        (acc, [key, value]) => {
          acc[key] = toStringArray(value);
          return acc;
        },
        {},
      )
    : undefined;
  return {
    message: data?.message ?? "Request failed",
    fieldErrors,
  };
}

// ── Service ──────────────────────────────────────────────────────────

export const hrmsService = {
  // ── Calendar ─────────────────────────────────────────────────────
  listCalendarEvents(params?: HrmsListParams) {
    return api.get<CalendarEventResponseDTO[]>(`${HRMS}/calendar/events`, {
      params: { academicYear: params?.academicYear, month: params?.month },
    });
  },

  createCalendarEvent(payload: CalendarEventCreateDTO) {
    return api.post<CalendarEventResponseDTO>(`${HRMS}/calendar/events`, payload);
  },

  createCalendarEventsBulk(payload: CalendarEventCreateDTO[]) {
    return api.post<{ totalProcessed: number; successCount: number; failedCount: number; errors: string[] }>(
      `${HRMS}/calendar/events/bulk`,
      payload,
    );
  },

  updateCalendarEvent(eventId: number, payload: CalendarEventCreateDTO) {
    return api.put<CalendarEventResponseDTO>(`${HRMS}/calendar/events/${eventId}`, payload);
  },

  deleteCalendarEvent(eventId: number) {
    return api.delete<void>(`${HRMS}/calendar/events/${eventId}`);
  },

  getCalendarSummary(academicYear: string) {
    return api.get<CalendarSummaryDTO>(`${HRMS}/calendar/summary`, {
      params: { academicYear },
    });
  },

  // ── Leave Types ──────────────────────────────────────────────────
  listLeaveTypes() {
    return api.get<LeaveTypeConfigResponseDTO[]>(`${HRMS}/leaves/types`);
  },

  getLeaveType(leaveTypeId: number) {
    return api.get<LeaveTypeConfigResponseDTO>(`${HRMS}/leaves/types/${leaveTypeId}`);
  },

  createLeaveType(payload: LeaveTypeConfigCreateUpdateDTO) {
    return api.post<LeaveTypeConfigResponseDTO>(`${HRMS}/leaves/types`, payload);
  },

  updateLeaveType(leaveTypeId: number, payload: LeaveTypeConfigCreateUpdateDTO) {
    return api.put<LeaveTypeConfigResponseDTO>(`${HRMS}/leaves/types/${leaveTypeId}`, payload);
  },

  deleteLeaveType(leaveTypeId: number) {
    return api.delete<void>(`${HRMS}/leaves/types/${leaveTypeId}`);
  },

  // ── Leave Applications ───────────────────────────────────────────
  listLeaveApplications(params?: HrmsListParams) {
    return api.get<PageResponse<LeaveApplicationResponseDTO>>(`${HRMS}/leaves/applications`, {
      params,
    });
  },

  getLeaveApplication(applicationId: number) {
    return api.get<LeaveApplicationResponseDTO>(`${HRMS}/leaves/applications/${applicationId}`);
  },

  applyLeave(payload: LeaveApplicationCreateDTO) {
    return api.post<LeaveApplicationResponseDTO>(`${HRMS}/leaves/applications`, payload);
  },

  approveLeave(applicationId: number, payload?: LeaveReviewDTO) {
    return api.post<LeaveApplicationResponseDTO>(
      `${HRMS}/leaves/applications/${applicationId}/approve`,
      payload ?? {},
    );
  },

  rejectLeave(applicationId: number, payload?: LeaveReviewDTO) {
    return api.post<LeaveApplicationResponseDTO>(
      `${HRMS}/leaves/applications/${applicationId}/reject`,
      payload ?? {},
    );
  },

  cancelLeave(applicationId: number, payload?: LeaveReviewDTO) {
    return api.post<LeaveApplicationResponseDTO>(
      `${HRMS}/leaves/applications/${applicationId}/cancel`,
      payload ?? {},
    );
  },

  // ── Leave Balances ───────────────────────────────────────────────
  getMyLeaveBalance() {
    return api.get<LeaveBalanceResponseDTO>(`${HRMS}/leaves/balance/me`);
  },

  getStaffLeaveBalance(staffId: number, academicYear?: string) {
    return api.get<LeaveBalanceResponseDTO>(`${HRMS}/leaves/balance/${staffId}`, {
      params: { academicYear },
    });
  },

  getAllLeaveBalances(params?: HrmsListParams) {
    return api.get<PageResponse<LeaveBalanceResponseDTO>>(`${HRMS}/leaves/balance/all`, {
      params,
    });
  },

  initializeLeaveBalances(payload: LeaveBalanceInitializeDTO) {
    return api.post<{ totalProcessed: number; successCount: number; failedCount: number; errors: string[] }>(
      `${HRMS}/leaves/balance/initialize`,
      payload,
    );
  },

  // ── Staff Grades ─────────────────────────────────────────────────
  listGrades() {
    return api.get<StaffGradeResponseDTO[]>(`${HRMS}/grades`);
  },

  createGrade(payload: StaffGradeCreateUpdateDTO) {
    return api.post<StaffGradeResponseDTO>(`${HRMS}/grades`, payload);
  },

  updateGrade(gradeId: number, payload: StaffGradeCreateUpdateDTO) {
    return api.put<StaffGradeResponseDTO>(`${HRMS}/grades/${gradeId}`, payload);
  },

  deleteGrade(gradeId: number) {
    return api.delete<void>(`${HRMS}/grades/${gradeId}`);
  },

  // ── Grade Assignments ────────────────────────────────────────────
  assignGrade(payload: StaffGradeAssignDTO) {
    return api.post<StaffGradeAssignmentResponseDTO>(`${HRMS}/grades/assign`, payload);
  },

  getStaffCurrentGrade(staffId: number) {
    return api.get<StaffGradeAssignmentResponseDTO>(`${HRMS}/grades/staff/${staffId}/current`);
  },

  getStaffGradeHistory(staffId: number) {
    return api.get<StaffGradeAssignmentResponseDTO[]>(`${HRMS}/grades/staff/${staffId}/history`);
  },

  listGradeAssignments(params?: HrmsListParams) {
    return api.get<PageResponse<StaffGradeAssignmentResponseDTO>>(`${HRMS}/grades/assignments`, {
      params,
    });
  },

  // ── Salary Components ────────────────────────────────────────────
  listSalaryComponents() {
    return api.get<SalaryComponentResponseDTO[]>(`${HRMS}/salary/components`);
  },

  createSalaryComponent(payload: SalaryComponentCreateUpdateDTO) {
    return api.post<SalaryComponentResponseDTO>(`${HRMS}/salary/components`, payload);
  },

  updateSalaryComponent(componentId: number, payload: SalaryComponentCreateUpdateDTO) {
    return api.put<SalaryComponentResponseDTO>(`${HRMS}/salary/components/${componentId}`, payload);
  },

  deleteSalaryComponent(componentId: number) {
    return api.delete<void>(`${HRMS}/salary/components/${componentId}`);
  },

  // ── Salary Templates ─────────────────────────────────────────────
  listSalaryTemplates() {
    return api.get<SalaryTemplateResponseDTO[]>(`${HRMS}/salary/templates`);
  },

  getSalaryTemplate(templateId: number) {
    return api.get<SalaryTemplateResponseDTO>(`${HRMS}/salary/templates/${templateId}`);
  },

  createSalaryTemplate(payload: SalaryTemplateCreateDTO) {
    return api.post<SalaryTemplateResponseDTO>(`${HRMS}/salary/templates`, payload);
  },

  updateSalaryTemplate(templateId: number, payload: SalaryTemplateUpdateDTO) {
    return api.put<SalaryTemplateResponseDTO>(`${HRMS}/salary/templates/${templateId}`, payload);
  },

  deleteSalaryTemplate(templateId: number) {
    return api.delete<void>(`${HRMS}/salary/templates/${templateId}`);
  },

  // ── Staff Salary Mappings ────────────────────────────────────────
  listSalaryMappings(params?: HrmsListParams) {
    return api.get<PageResponse<StaffSalaryMappingResponseDTO>>(`${HRMS}/salary/mappings`, {
      params,
    });
  },

  getStaffSalaryMapping(staffId: number) {
    return api.get<StaffSalaryMappingResponseDTO>(`${HRMS}/salary/mappings/staff/${staffId}`);
  },

  createSalaryMapping(payload: StaffSalaryMappingCreateDTO) {
    return api.post<StaffSalaryMappingResponseDTO>(`${HRMS}/salary/mappings`, payload);
  },

  updateSalaryMapping(mappingId: number, payload: StaffSalaryMappingCreateDTO) {
    return api.put<StaffSalaryMappingResponseDTO>(`${HRMS}/salary/mappings/${mappingId}`, payload);
  },

  bulkCreateSalaryMappings(payload: StaffSalaryMappingCreateDTO[]) {
    return api.post<{ totalProcessed: number; successCount: number; failedCount: number; errors: string[] }>(
      `${HRMS}/salary/mappings/bulk`,
      payload,
    );
  },

  getComputedSalary(mappingId: number) {
    return api.get<ComputedSalaryBreakdownDTO>(`${HRMS}/salary/mappings/${mappingId}/computed`);
  },

  // ── Payroll Runs ─────────────────────────────────────────────────
  listPayrollRuns(params?: HrmsListParams) {
    return api.get<PageResponse<PayrollRunResponseDTO>>(`${HRMS}/payroll/runs`, { params });
  },

  getPayrollRun(runId: number) {
    return api.get<PayrollRunResponseDTO>(`${HRMS}/payroll/runs/${runId}`);
  },

  createPayrollRun(payload: PayrollRunCreateDTO) {
    return api.post<PayrollRunResponseDTO>(`${HRMS}/payroll/runs`, payload);
  },

  approvePayrollRun(runId: number) {
    return api.post<PayrollRunResponseDTO>(`${HRMS}/payroll/runs/${runId}/approve`);
  },

  disbursePayrollRun(runId: number) {
    return api.post<PayrollRunResponseDTO>(`${HRMS}/payroll/runs/${runId}/disburse`);
  },

  // ── Payslips (Admin) ─────────────────────────────────────────────
  listPayslipsByRun(runId: number, params?: HrmsListParams) {
    return api.get<PageResponse<PayslipSummaryDTO>>(`${HRMS}/payroll/runs/${runId}/payslips`, {
      params,
    });
  },

  getPayslip(payslipId: number) {
    return api.get<PayslipDetailDTO>(`${HRMS}/payroll/payslips/${payslipId}`);
  },

  downloadPayslipPdf(payslipId: number) {
    return api.get<Blob>(`${HRMS}/payroll/payslips/${payslipId}/pdf`, {
      responseType: "blob",
    });
  },

  listStaffPayslips(staffId: number, params?: HrmsListParams) {
    return api.get<PageResponse<PayslipSummaryDTO>>(`${HRMS}/payroll/staff/${staffId}/payslips`, {
      params,
    });
  },

  // ── Payslips (Self-service) ──────────────────────────────────────
  listMyPayslips(params?: HrmsListParams) {
    return api.get<PageResponse<PayslipSummaryDTO>>(`${HRMS}/payroll/self/payslips`, { params });
  },

  getMyPayslip(payslipId: number) {
    return api.get<PayslipDetailDTO>(`${HRMS}/payroll/self/payslips/${payslipId}`);
  },

  downloadMyPayslipPdf(payslipId: number) {
    return api.get<Blob>(`${HRMS}/payroll/self/payslips/${payslipId}/pdf`, {
      responseType: "blob",
    });
  },

  // ── Self-service Attendance ──────────────────────────────────────
  getMyAttendanceSummary(params?: Pick<HrmsListParams, "year" | "month">) {
    return api.get<StaffAttendanceSummaryDTO>(`${HRMS}/payroll/self/attendance`, {
      params,
    });
  },

  // ── Dashboard ────────────────────────────────────────────────────
  getDashboardSummary() {
    return api.get<HrmsDashboardSummaryDTO>(`${HRMS}/dashboard/summary`);
  },
};
