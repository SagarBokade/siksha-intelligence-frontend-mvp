import { api } from "@/lib/axios";
import type {
  CreateUserRequestDTO,
  CreateStudentRequestDTO,
  CreateTeacherRequestDTO,
  CreatePrincipalRequestDTO,
  CreateLibrarianRequestDTO,
  UpdateStudentRequestDTO,
  UpdateStaffRequestDTO,
} from "./types/admin";

// ── DTOs returned by the new list endpoints ───────────────────────────

export interface StudentSummaryDTO {
  studentId: number;
  uuid: string;
  enrollmentNumber: string;
  enrollmentStatus: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  username: string;
  dateOfBirth?: string;
  gender?: string;
  rollNo?: number;
  enrollmentDate?: string;
  className?: string;
  sectionName?: string;
}

export interface StaffSummaryDTO {
  staffId: number;
  uuid: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  username: string;
  dateOfBirth?: string;
  gender?: string;
  jobTitle: string;
  department?: string;
  staffType: string;
  hireDate?: string;
  officeLocation?: string;
  active: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;          // current page (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ListStudentsParams {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface ListStaffParams {
  search?: string;
  staffType?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ── Admin User Management Service ────────────────────────────────────

export const adminService = {
  /** GET /auth/admin/users/students — paginated list with search
   *  NOTE: do NOT pass sortBy until backend fixes JPQL — `s.firstName` is on UserProfile not Student */
  listStudents({ sortBy: _sortBy, sortDir: _sortDir, ...params }: ListStudentsParams = {}) {
    return api.get<PageResponse<StudentSummaryDTO>>("/auth/admin/users/students", { params });
  },

  /** GET /auth/admin/users/staff — paginated list with search, staffType
   *  NOTE: same sortBy issue — omit until backend JPQL is fixed */
  listStaff({ sortBy: _sortBy, sortDir: _sortDir, ...params }: ListStaffParams = {}) {
    return api.get<PageResponse<StaffSummaryDTO>>("/auth/admin/users/staff", { params });
  },

  /** POST /auth/admin/users/school-admin */
  createSchoolAdmin(data: CreateUserRequestDTO) {
    return api.post<string>("/auth/admin/users/school-admin", data);
  },

  /** POST /auth/admin/users/student */
  createStudent(data: CreateStudentRequestDTO) {
    return api.post<string>("/auth/admin/users/student", data);
  },

  /** POST /auth/admin/users/staff/teacher */
  createTeacher(data: CreateTeacherRequestDTO) {
    return api.post<string>("/auth/admin/users/staff/teacher", data);
  },

  /** POST /auth/admin/users/staff/principal */
  createPrincipal(data: CreatePrincipalRequestDTO) {
    return api.post<string>("/auth/admin/users/staff/principal", data);
  },

  /** POST /auth/admin/users/staff/librarian */
  createLibrarian(data: CreateLibrarianRequestDTO) {
    return api.post<string>("/auth/admin/users/staff/librarian", data);
  },

  /** PUT /auth/admin/users/student/{studentId} — studentId is the UUID field */
  updateStudent(uuid: string, data: UpdateStudentRequestDTO) {
    return api.put<string>(`/auth/admin/users/student/${uuid}`, data);
  },

  /** PUT /auth/admin/users/staff/{staffId} — staffId is the UUID field */
  updateStaff(uuid: string, data: UpdateStaffRequestDTO) {
    return api.put<string>(`/auth/admin/users/staff/${uuid}`, data);
  },
};

