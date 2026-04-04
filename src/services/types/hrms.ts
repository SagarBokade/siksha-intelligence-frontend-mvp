import type { Pageable } from "./common";

// ── Enums ────────────────────────────────────────────────────────────
export type DayType = "WORKING" | "HOLIDAY" | "HALF_DAY" | "RESTRICTED_HOLIDAY" | "EXAM_DAY" | "VACATION";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type HalfDayType = "FIRST_HALF" | "SECOND_HALF";
export type TeachingWing = "PRIMARY" | "SECONDARY" | "SENIOR_SECONDARY" | "HIGHER_SECONDARY";
export type SalaryComponentType = "EARNING" | "DEDUCTION";
export type CalculationMethod = "FIXED" | "PERCENTAGE_OF_BASIC" | "PERCENTAGE_OF_GROSS";
export type PayrollStatus = "DRAFT" | "PROCESSING" | "PROCESSED" | "APPROVED" | "DISBURSED" | "FAILED";

// ── Error handling ───────────────────────────────────────────────────
export interface HrmsFieldErrorMap {
  [fieldName: string]: string | string[];
}

export interface HrmsApiErrorResponse {
  statusCode?: number;
  message?: string;
  path?: string;
  timestamp?: string;
  fieldErrors?: HrmsFieldErrorMap;
}

// ── Academic Calendar ────────────────────────────────────────────────
export interface CalendarEventResponseDTO {
  eventId: number;
  uuid: string;
  academicYear: string;
  date: string;
  dayType: DayType;
  title?: string;
  description?: string;
  appliesToStaff: boolean;
  appliesToStudents: boolean;
  createdAt: string;
}

export interface CalendarEventCreateDTO {
  academicYear: string;
  date: string;
  dayType: DayType;
  title?: string;
  description?: string;
  appliesToStaff?: boolean;
  appliesToStudents?: boolean;
}

export interface CalendarSummaryDTO {
  academicYear: string;
  totalWorkingDays: number;
  totalHolidays: number;
  totalHalfDays: number;
  months: CalendarMonthSummary[];
}

export interface CalendarMonthSummary {
  month: number;
  monthName: string;
  workingDays: number;
  holidays: number;
  halfDays: number;
}

// ── Leave Type Configuration ─────────────────────────────────────────
export interface LeaveTypeConfigResponseDTO {
  leaveTypeId: number;
  uuid: string;
  leaveCode: string;
  displayName: string;
  description?: string;
  annualQuota: number;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  encashmentAllowed: boolean;
  minDaysBeforeApply: number;
  maxConsecutiveDays?: number;
  requiresDocument: boolean;
  documentRequiredAfterDays?: number;
  isPaid: boolean;
  applicableGrades?: string[];
  active: boolean;
  sortOrder: number;
}

export interface LeaveTypeConfigCreateUpdateDTO {
  leaveCode: string;
  displayName: string;
  description?: string;
  annualQuota: number;
  carryForwardAllowed?: boolean;
  maxCarryForward?: number;
  encashmentAllowed?: boolean;
  minDaysBeforeApply?: number;
  maxConsecutiveDays?: number;
  requiresDocument?: boolean;
  documentRequiredAfterDays?: number;
  isPaid?: boolean;
  applicableGrades?: string[];
  sortOrder?: number;
}

// ── Leave Applications ───────────────────────────────────────────────
export interface LeaveApplicationResponseDTO {
  applicationId: number;
  uuid: string;
  staffId: number;
  staffName: string;
  leaveTypeId: number;
  leaveTypeCode: string;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  isHalfDay: boolean;
  halfDayType?: HalfDayType;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedByStaffId?: number;
  reviewedOn?: string;
  reviewRemarks?: string;
  attachmentUrl?: string;
}

export interface LeaveApplicationCreateDTO {
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  isHalfDay?: boolean;
  halfDayType?: HalfDayType;
  reason: string;
  attachmentUrl?: string;
}

export interface LeaveReviewDTO {
  remarks?: string;
}

// ── Leave Balance ────────────────────────────────────────────────────
export interface LeaveBalanceResponseDTO {
  staffId: number;
  staffName: string;
  academicYear: string;
  balances: LeaveBalanceItemDTO[];
}

export interface LeaveBalanceItemDTO {
  leaveTypeId: number;
  leaveCode: string;
  displayName: string;
  totalQuota: number;
  used: number;
  remaining: number;
  carriedForward: number;
}

export interface LeaveBalanceInitializeDTO {
  academicYear: string;
  carryForwardFromYear?: string;
}

// ── Staff Grades ─────────────────────────────────────────────────────
export interface StaffGradeResponseDTO {
  gradeId: number;
  uuid: string;
  gradeCode: string;
  gradeName: string;
  teachingWing: TeachingWing;
  payBandMin: number;
  payBandMax: number;
  sortOrder: number;
  minYearsForPromotion?: number;
  description?: string;
  active: boolean;
}

export interface StaffGradeCreateUpdateDTO {
  gradeCode: string;
  gradeName: string;
  teachingWing: TeachingWing;
  payBandMin: number;
  payBandMax: number;
  sortOrder: number;
  minYearsForPromotion?: number;
  description?: string;
}

export interface StaffGradeAssignmentResponseDTO {
  assignmentId: number;
  staffId: number;
  staffName: string;
  gradeId: number;
  gradeCode: string;
  gradeName: string;
  teachingWing: TeachingWing;
  effectiveFrom: string;
  effectiveTo?: string;
  promotionOrderRef?: string;
  promotedBy?: number;
  remarks?: string;
  createdAt: string;
}

export interface StaffGradeAssignDTO {
  staffId: number;
  gradeId: number;
  effectiveFrom: string;
  promotionOrderRef?: string;
  remarks?: string;
}

// ── Salary Components ────────────────────────────────────────────────
export interface SalaryComponentResponseDTO {
  componentId: number;
  componentCode: string;
  componentName: string;
  type: SalaryComponentType;
  calculationMethod: CalculationMethod;
  defaultValue: number;
  isTaxable: boolean;
  isStatutory: boolean;
  sortOrder: number;
  active: boolean;
}

export interface SalaryComponentCreateUpdateDTO {
  componentCode: string;
  componentName: string;
  type: SalaryComponentType;
  calculationMethod: CalculationMethod;
  defaultValue: number;
  isTaxable?: boolean;
  isStatutory?: boolean;
  sortOrder?: number;
}

// ── Salary Templates ─────────────────────────────────────────────────
export interface SalaryTemplateResponseDTO {
  templateId: number;
  uuid: string;
  templateName: string;
  description?: string;
  gradeId?: number;
  gradeName?: string;
  academicYear: string;
  components: SalaryTemplateComponentDTO[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryTemplateComponentDTO {
  componentId: number;
  componentCode: string;
  componentName: string;
  type: SalaryComponentType;
  calculationMethod: CalculationMethod;
  value: number;
}

export interface SalaryTemplateCreateDTO {
  templateName: string;
  description?: string;
  gradeId?: number;
  academicYear: string;
  components: { componentId: number; value: number }[];
}

export interface SalaryTemplateUpdateDTO {
  templateName?: string;
  description?: string;
  gradeId?: number;
  academicYear?: string;
  components?: { componentId: number; value: number }[];
  active?: boolean;
}

// ── Staff Salary Mapping ─────────────────────────────────────────────
export interface StaffSalaryMappingResponseDTO {
  mappingId: number;
  staffId: number;
  staffName: string;
  employeeId: string;
  gradeCode?: string;
  templateId: number;
  templateName: string;
  effectiveFrom: string;
  effectiveTo?: string;
  ctc: number;
  netPay: number;
  hasOverrides: boolean;
  overrides?: ComponentOverrideDTO[];
  remarks?: string;
}

export interface ComponentOverrideDTO {
  componentId: number;
  componentCode: string;
  componentName: string;
  overrideValue: number;
  reason?: string;
}

export interface StaffSalaryMappingCreateDTO {
  staffId: number;
  templateId: number;
  effectiveFrom: string;
  effectiveTo?: string;
  remarks?: string;
  overrides?: { componentId: number; overrideValue: number; reason?: string }[];
}

export interface ComputedSalaryBreakdownDTO {
  staffId: number;
  staffName: string;
  employeeId: string;
  templateName: string;
  gradeCode?: string;
  earnings: ComputedComponentDTO[];
  deductions: ComputedComponentDTO[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  ctc: number;
  hasOverrides: boolean;
}

export interface ComputedComponentDTO {
  componentCode: string;
  componentName: string;
  calculationMethod: string;
  configuredValue: number;
  computedAmount: number;
  isOverridden: boolean;
  isStatutory: boolean;
}

// ── Payroll ──────────────────────────────────────────────────────────
export interface PayrollRunCreateDTO {
  payYear: number;
  payMonth: number;
  remarks?: string;
}

export interface PayrollRunResponseDTO {
  runId: number;
  runUuid: string;
  payYear: number;
  payMonth: number;
  status: PayrollStatus;
  remarks?: string;
  totalStaff: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  processedOn?: string;
  approvedOn?: string;
  disbursedOn?: string;
  entries: PayslipSummaryDTO[];
}

export interface PayslipSummaryDTO {
  payslipId: number;
  staffId: number;
  staffName: string;
  employeeId: string;
  payMonth: number;
  payYear: number;
  netPay: number;
  status: PayrollStatus;
}

export interface PayslipDetailDTO {
  payslipId: number;
  runId: number;
  staffId: number;
  staffName: string;
  employeeId: string;
  payMonth: number;
  payYear: number;
  gradeCode?: string;
  gradeName?: string;
  department?: string;
  earnings: PayslipLineItemDTO[];
  deductions: PayslipLineItemDTO[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  totalWorkingDays: number;
  daysPresent: number;
  daysAbsent: number;
  lopDays: number;
  status: PayrollStatus;
  generatedAt: string;
}

export interface PayslipLineItemDTO {
  componentCode: string;
  componentName: string;
  amount: number;
}

// ── Dashboard ────────────────────────────────────────────────────────
export interface HrmsDashboardSummaryDTO {
  totalActiveStaff: number;
  staffWithSalaryMapping: number;
  staffWithoutSalaryMapping: number;
  totalPayrollThisMonth: number;
  totalPayrollLastMonth: number;
  pendingLeaveApplications: number;
  todayPresent: number;
  todayAbsent: number;
  todayOnLeave: number;
  gradeDistribution: { gradeCode: string; gradeName: string; count: number }[];
  payrollTrend: { month: string; amount: number }[];
}

// ── Self-service attendance ──────────────────────────────────────────
export interface StaffAttendanceSummaryDTO {
  periodLabel: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
}

// ── Query params ─────────────────────────────────────────────────────
export interface HrmsListParams extends Pageable {
  search?: string;
  status?: string;
  staffId?: number;
  leaveTypeCode?: string;
  fromDate?: string;
  toDate?: string;
  academicYear?: string;
  year?: number;
  month?: number;
}
