import { api } from "@/lib/axios";
import type { PageResponse, Pageable } from "./types/common";
import type {
  FeeTypeCreateUpdateDTO,
  FeeTypeResponseDTO,
  FeeStructureCreateDTO,
  FeeStructureUpdateDTO,
  FeeStructureResponseDTO,
  StudentFeeMapCreateDTO,
  StudentFeeMapUpdateDTO,
  StudentFeeMapResponseDTO,
  InvoiceResponseDTO,
  PaymentResponseDTO,
  PaymentUpdateDTO,
  RecordOfflinePaymentDTO,
  LateFeeRuleCreateDTO,
  LateFeeRuleResponseDTO,
  InitiatePaymentRequestDTO,
  InitiatePaymentResponseDTO,
  VerifyPaymentRequestDTO,
  AdminDashboardSummaryDTO,
  ParentDashboardSummaryDTO,
} from "./types/finance";

// ── Finance Service ──────────────────────────────────────────────────

export const financeService = {
  // ── Fee Types ────────────────────────────────────────────────────
  /** GET /auth/finance/fee-types */
  getAllFeeTypes() {
    return api.get<FeeTypeResponseDTO[]>("/auth/finance/fee-types");
  },

  /** POST /auth/finance/fee-types */
  createFeeType(data: FeeTypeCreateUpdateDTO) {
    return api.post<FeeTypeResponseDTO>("/auth/finance/fee-types", data);
  },

  /** GET /auth/finance/fee-types/:id */
  getFeeTypeById(id: number) {
    return api.get<FeeTypeResponseDTO>(`/auth/finance/fee-types/${id}`);
  },

  /** PUT /auth/finance/fee-types/:id */
  updateFeeType(id: number, data: FeeTypeCreateUpdateDTO) {
    return api.put<FeeTypeResponseDTO>(`/auth/finance/fee-types/${id}`, data);
  },

  /** DELETE /auth/finance/fee-types/:id */
  deleteFeeType(id: number) {
    return api.delete(`/auth/finance/fee-types/${id}`);
  },

  // ── Fee Structures ───────────────────────────────────────────────
  /** GET /auth/finance/structures */
  getAllFeeStructures() {
    return api.get<FeeStructureResponseDTO[]>("/auth/finance/structures");
  },

  /** POST /auth/finance/structures */
  createFeeStructure(data: FeeStructureCreateDTO) {
    return api.post<FeeStructureResponseDTO>("/auth/finance/structures", data);
  },

  /** GET /auth/finance/:structureId */
  getFeeStructureById(structureId: number) {
    return api.get<FeeStructureResponseDTO>(`/auth/finance/${structureId}`);
  },

  /** PUT /auth/finance/:structureId */
  updateFeeStructure(structureId: number, data: FeeStructureUpdateDTO) {
    return api.put<FeeStructureResponseDTO>(`/auth/finance/${structureId}`, data);
  },

  /** DELETE /auth/finance/:structureId */
  deleteFeeStructure(structureId: number) {
    return api.delete(`/auth/finance/${structureId}`);
  },

  // ── Student-Fee Maps ─────────────────────────────────────────────
  /** GET /auth/finance/student-maps */
  getAllStudentFeeMaps() {
    return api.get<StudentFeeMapResponseDTO[]>("/auth/finance/student-maps");
  },

  /** POST /auth/finance/student-maps */
  createStudentFeeMap(data: StudentFeeMapCreateDTO) {
    return api.post<StudentFeeMapResponseDTO>("/auth/finance/student-maps", data);
  },

  /** GET /auth/finance/student-maps/:mapId */
  getStudentFeeMapById(mapId: number) {
    return api.get<StudentFeeMapResponseDTO>(`/auth/finance/student-maps/${mapId}`);
  },

  /** PUT /auth/finance/student-maps/:mapId */
  updateStudentFeeMap(mapId: number, data: StudentFeeMapUpdateDTO) {
    return api.put<StudentFeeMapResponseDTO>(`/auth/finance/student-maps/${mapId}`, data);
  },

  // ── Invoices ─────────────────────────────────────────────────────
  /** GET /auth/finance/invoices (paginated) */
  getAllInvoices(params?: Pageable) {
    return api.get<PageResponse<InvoiceResponseDTO>>("/auth/finance/invoices", {
      params,
    });
  },

  /** GET /auth/finance/invoices/:invoiceId */
  getInvoiceById(invoiceId: number) {
    return api.get<InvoiceResponseDTO>(`/auth/finance/invoices/${invoiceId}`);
  },

  /** POST /auth/finance/invoices/:invoiceId/cancel */
  cancelInvoice(invoiceId: number) {
    return api.post<InvoiceResponseDTO>(`/auth/finance/invoices/${invoiceId}/cancel`);
  },

  /** POST /auth/finance/invoices/:invoiceId/apply-late-fee */
  applyLateFee(invoiceId: number) {
    return api.post<InvoiceResponseDTO>(
      `/auth/finance/invoices/${invoiceId}/apply-late-fee`
    );
  },

  /** POST /auth/finance/invoices/generate-single/:studentId */
  generateSingleInvoice(studentId: number) {
    return api.post<InvoiceResponseDTO>(
      `/auth/finance/invoices/generate-single/${studentId}`
    );
  },

  /** GET /auth/finance/invoices/:invoiceId/receipt */
  getInvoiceReceipt(invoiceId: number) {
    return api.get<Blob>(`/auth/finance/invoices/${invoiceId}/receipt`, {
      responseType: "blob",
    });
  },

  // ── Payments ─────────────────────────────────────────────────────
  /** GET /auth/finance/payments (paginated) */
  getAllPayments(params?: Pageable) {
    return api.get<PageResponse<PaymentResponseDTO>>("/auth/finance/payments", {
      params,
    });
  },

  /** GET /auth/finance/payments/:paymentId */
  getPaymentById(paymentId: number) {
    return api.get<PaymentResponseDTO>(`/auth/finance/payments/${paymentId}`);
  },

  /** PUT /auth/finance/payments/:paymentId */
  updatePayment(paymentId: number, data: PaymentUpdateDTO) {
    return api.put<PaymentResponseDTO>(`/auth/finance/payments/${paymentId}`, data);
  },

  /** POST /auth/finance/payments/record-offline */
  recordOfflinePayment(data: RecordOfflinePaymentDTO) {
    return api.post<PaymentResponseDTO>("/auth/finance/payments/record-offline", data);
  },

  // ── Late Fee Rules ───────────────────────────────────────────────
  /** GET /auth/finance/late-fee-rules */
  getAllLateFeeRules() {
    return api.get<LateFeeRuleResponseDTO[]>("/auth/finance/late-fee-rules");
  },

  /** POST /auth/finance/late-fee-rules */
  createLateFeeRule(data: LateFeeRuleCreateDTO) {
    return api.post<LateFeeRuleResponseDTO>("/auth/finance/late-fee-rules", data);
  },

  /** PUT /auth/finance/late-fee-rules/:ruleId */
  updateLateFeeRule(ruleId: number, data: LateFeeRuleCreateDTO) {
    return api.put<LateFeeRuleResponseDTO>(`/auth/finance/late-fee-rules/${ruleId}`, data);
  },

  // ── Parent Portal ────────────────────────────────────────────────
  /** POST /auth/finance/parent/payments/initiate */
  initiatePayment(data: InitiatePaymentRequestDTO) {
    return api.post<InitiatePaymentResponseDTO>(
      "/auth/finance/parent/payments/initiate",
      data
    );
  },

  /** POST /auth/finance/parent/payments/verify */
  verifyPayment(data: VerifyPaymentRequestDTO) {
    return api.post<PaymentResponseDTO>("/auth/finance/parent/payments/verify", data);
  },

  /** GET /auth/finance/parent/invoices/:invoiceId */
  getInvoiceForParent(invoiceId: number) {
    return api.get<InvoiceResponseDTO>(`/auth/finance/parent/invoices/${invoiceId}`);
  },

  /** GET /auth/finance/parent/invoices/for-student/:studentId */
  getInvoicesForStudent(studentId: number) {
    return api.get<InvoiceResponseDTO[]>(
      `/auth/finance/parent/invoices/for-student/${studentId}`
    );
  },

  // ── Dashboard ────────────────────────────────────────────────────
  /** GET /auth/finance/dashboard/summary */
  getAdminDashboardSummary() {
    return api.get<AdminDashboardSummaryDTO>("/auth/finance/dashboard/summary");
  },

  /** GET /auth/finance/dashboard/invoices/:invoiceId */
  getDashboardInvoiceById(invoiceId: number) {
    return api.get<InvoiceResponseDTO>(`/auth/finance/dashboard/invoices/${invoiceId}`);
  },

  /** GET /auth/finance/dashboard/invoices/for-student/:studentId */
  getDashboardInvoicesForStudent(studentId: number) {
    return api.get<InvoiceResponseDTO[]>(
      `/auth/finance/dashboard/invoices/for-student/${studentId}`
    );
  },

  /** GET /auth/finance/dashboard/dashboard/summary/for-student/:studentId */
  getParentDashboardSummary(studentId: number) {
    return api.get<ParentDashboardSummaryDTO>(
      `/auth/finance/dashboard/dashboard/summary/for-student/${studentId}`
    );
  },
};
