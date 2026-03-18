// ── Profile DTOs ─────────────────────────────────────────────────────

export type Gender = "MALE" | "FEMALE" | "NON_BINARY" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface UserProfileUpdateDTO {
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  dateOfBirth?: string;
  contactPhone?: string;
  bio?: string;
  gender?: string;
}

export interface UserProfileDTO {
  profileId: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: Gender;
  username: string;
  email: string;
}

export interface UserProfileResponseDTO {
  id: number;
  uuid: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  bio?: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressDTO {
  id?: number;
  addressType?: "HOME" | "MAILING" | "WORK" | "OTHER";
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// ── Student-specific ─────────────────────────────────────────────────

export interface StudentMedicalAllergyDTO {
  allergy: string;
  severity?: string;
  notes?: string;
}

export interface StudentMedicalMedicationDTO {
  medicationName: string;
  dosage?: string;
  frequency?: string;
}

export interface StudentMedicalRecordDTO {
  id: number;
  physicianName?: string;
  physicianPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: StudentMedicalAllergyDTO[];
  medications?: StudentMedicalMedicationDTO[];
}

export interface StudentProfileDTO {
  studentId: number;
  enrollmentNo?: string;
  enrollmentStatus?: string;
  medicalRecord?: StudentMedicalRecordDTO;
}

// ── Staff-specific ───────────────────────────────────────────────────

export type StaffType =
  | "TEACHER"
  | "LIBRARIAN"
  | "PRINCIPAL"
  | "SECURITY_GUARD"
  | "ADMINISTRATIVE_STAFF"
  | "SCHOOL_ADMIN"
  | "SUPER_ADMIN"
  | "OTHER";

export interface TeacherDetailsDTO {
  certifications?: string;
  specializations?: string;
  yearsOfExperience?: number;
  educationLevel?: string;
  stateLicenseNumber?: string;
}

export type SchoolLevel = "PRIMARY" | "MIDDLE" | "HIGH" | "ALL";

export interface PrincipalDetailsDTO {
  administrativeCertifications?: string;
  schoolLevelManaged?: SchoolLevel;
  budgetApprovalLimit?: number;
}

export interface StaffProfileDTO {
  staffId: number;
  staffSystemId?: string;
  jobTitle?: string;
  department?: string;
  staffType?: StaffType;
  hireDate?: string;
  terminationDate?: string;
  officeLocation?: string;
  managerId?: number;
  managerName?: string;
  teacherDetails?: TeacherDetailsDTO;
  principalDetails?: PrincipalDetailsDTO;
  active: boolean;
}

// ── Guardian-specific ────────────────────────────────────────────────

export interface LinkedStudentDTO {
  studentId: number;
  studentName: string;
  enrollmentNo?: string;
  relationshipType?: string;
}

export interface GuardianProfileDTO {
  guardianId: number;
  occupation?: string;
  employer?: string;
  linkedStudents?: LinkedStudentDTO[];
}

// ── Comprehensive Profile ────────────────────────────────────────────

export interface ComprehensiveUserProfileResponseDTO {
  basicProfile: UserProfileResponseDTO;
  addresses?: AddressDTO[];
  studentDetails?: StudentProfileDTO;
  staffDetails?: StaffProfileDTO;
  guardianDetails?: GuardianProfileDTO;
}
