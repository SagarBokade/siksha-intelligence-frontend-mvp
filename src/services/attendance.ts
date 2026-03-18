import { api } from "@/lib/axios";
import type { PageResponse } from "./types/common";
import type {
  AttendanceTypeRequestDTO,
  AttendanceTypeResponseDTO,
  StudentAttendanceRequestDTO,
  StudentAttendanceResponseDTO,
  StudentAttendanceQueryParams,
  StaffAttendanceRequestDTO,
  StaffAttendanceResponseDTO,
  StaffAttendanceQueryParams,
  SubmitExcuseRequestDTO,
  AbsenceDocumentationResponseDTO,
} from "./types/attendance";

// ── Attendance Service ───────────────────────────────────────────────

export const attendanceService = {
  // ── Types ────────────────────────────────────────────────────────
  /** GET /auth/ams/types */
  getAllTypes() {
    return api.get<AttendanceTypeResponseDTO[]>("/auth/ams/types");
  },

  /** POST /auth/ams/types */
  createType(data: AttendanceTypeRequestDTO) {
    return api.post<AttendanceTypeResponseDTO>("/auth/ams/types", data);
  },

  /** GET /auth/ams/types/:typeId */
  getTypeById(typeId: number) {
    return api.get<AttendanceTypeResponseDTO>(`/auth/ams/types/${typeId}`);
  },

  /** PUT /auth/ams/types/:typeId */
  updateType(typeId: number, data: AttendanceTypeRequestDTO) {
    return api.put<AttendanceTypeResponseDTO>(`/auth/ams/types/${typeId}`, data);
  },

  /** DELETE /auth/ams/types/:typeId */
  deleteType(typeId: number) {
    return api.delete(`/auth/ams/types/${typeId}`);
  },

  // ── Student Attendance ───────────────────────────────────────────
  /** GET /auth/ams/records (paginated) */
  listStudentAttendance(params?: StudentAttendanceQueryParams) {
    return api.get<PageResponse<StudentAttendanceResponseDTO>>("/auth/ams/records", {
      params,
    });
  },

  /** POST /auth/ams/records (batch create) */
  createStudentAttendanceBatch(
    data: StudentAttendanceRequestDTO[],
    staffId?: number
  ) {
    return api.post<StudentAttendanceResponseDTO[]>("/auth/ams/records", data, {
      headers: staffId != null ? { "X-User-Id": staffId } : undefined,
    });
  },

  /** GET /auth/ams/records/:id */
  getStudentAttendanceById(id: number) {
    return api.get<StudentAttendanceResponseDTO>(`/auth/ams/records/${id}`);
  },

  /** PUT /auth/ams/records/:id */
  updateStudentAttendance(
    id: number,
    data: StudentAttendanceRequestDTO,
    staffId?: number
  ) {
    return api.put<StudentAttendanceResponseDTO>(`/auth/ams/records/${id}`, data, {
      headers: staffId != null ? { "X-User-Id": staffId } : undefined,
    });
  },

  /** DELETE /auth/ams/records/:id */
  deleteStudentAttendance(id: number, staffId?: number) {
    return api.delete(`/auth/ams/records/${id}`, {
      headers: staffId != null ? { "X-User-Id": staffId } : undefined,
    });
  },

  // ── Staff Attendance ─────────────────────────────────────────────
  /** GET /auth/ams/staff (paginated) */
  listStaffAttendance(params?: StaffAttendanceQueryParams) {
    return api.get<PageResponse<StaffAttendanceResponseDTO>>("/auth/ams/staff", {
      params,
    });
  },

  /** POST /auth/ams/staff */
  createStaffAttendance(data: StaffAttendanceRequestDTO, userId?: number) {
    return api.post<StaffAttendanceResponseDTO>("/auth/ams/staff", data, {
      headers: userId != null ? { "X-User-Id": userId } : undefined,
    });
  },

  /** POST /auth/ams/staff/bulk */
  createStaffAttendanceBulk(data: StaffAttendanceRequestDTO[], userId?: number) {
    return api.post<StaffAttendanceResponseDTO[]>("/auth/ams/staff/bulk", data, {
      headers: userId != null ? { "X-User-Id": userId } : undefined,
    });
  },

  /** GET /auth/ams/staff/:id */
  getStaffAttendanceById(id: number) {
    return api.get<StaffAttendanceResponseDTO>(`/auth/ams/staff/${id}`);
  },

  /** PUT /auth/ams/staff/:id */
  updateStaffAttendance(id: number, data: StaffAttendanceRequestDTO, userId?: number) {
    return api.put<StaffAttendanceResponseDTO>(`/auth/ams/staff/${id}`, data, {
      headers: userId != null ? { "X-User-Id": userId } : undefined,
    });
  },

  /** DELETE /auth/ams/staff/:id */
  deleteStaffAttendance(id: number, userId?: number) {
    return api.delete(`/auth/ams/staff/${id}`, {
      headers: userId != null ? { "X-User-Id": userId } : undefined,
    });
  },

  // ── Absence Documentation ────────────────────────────────────────
  /** POST /auth/ams/excuses/submit */
  submitExcuse(data: SubmitExcuseRequestDTO) {
    return api.post<AbsenceDocumentationResponseDTO>("/auth/ams/excuses/submit", data);
  },

  /** GET /auth/ams/excuses/:docId */
  getExcuseById(docId: number) {
    return api.get<AbsenceDocumentationResponseDTO>(`/auth/ams/excuses/${docId}`);
  },

  /** POST /auth/ams/excuses/:docId/approve */
  approveExcuse(docId: number, userId?: number) {
    return api.post<AbsenceDocumentationResponseDTO>(
      `/auth/ams/excuses/${docId}/approve`,
      null,
      { headers: userId != null ? { "X-User-Id": userId } : undefined }
    );
  },

  /** POST /auth/ams/excuses/:docId/reject */
  rejectExcuse(docId: number, body?: Record<string, string>, userId?: number) {
    return api.post<AbsenceDocumentationResponseDTO>(
      `/auth/ams/excuses/${docId}/reject`,
      body ?? null,
      { headers: userId != null ? { "X-User-Id": userId } : undefined }
    );
  },

  /** GET /auth/ams/excuses/pending (paginated) */
  getPendingExcuses(page?: number, size?: number) {
    return api.get<PageResponse<AbsenceDocumentationResponseDTO>>(
      "/auth/ams/excuses/pending",
      { params: { page, size } }
    );
  },
};
