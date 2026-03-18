/**
 * CSV Template utilities for bulk import.
 *
 * The template file is served directly from the backend:
 *   GET /api/v1/auth/bulk-import/template/{userType}
 *
 * The backend is the single source of truth for both the template format
 * and the validation rules (CsvValidationHelper.java).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Template Download (from backend)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Download the CSV template by fetching it from the backend.
 * The backend sets Content-Disposition so the correct filename is used.
 *
 * @param userType  "students" | "staff"
 * @param accessToken  Current JWT access token for the Authorization header.
 */
export async function downloadCsvTemplate(
  userType: "students" | "staff",
  accessToken: string | null
): Promise<void> {
  if (!accessToken) {
    console.warn("downloadCsvTemplate: no access token — cannot fetch template");
    return;
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");
  const prefix = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(/\/+$/, "");
  const version = (import.meta.env.VITE_API_VERSION ?? "v1").replace(/^\/+/, "").replace(/\/+$/, "");
  const url = `${baseUrl}${prefix}/${version}/auth/bulk-import/template/${userType}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to download template: ${res.status} ${res.statusText}`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", objectUrl);
  link.setAttribute("download", `${userType}_template.csv`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// FUTURE UPDATE: Client-side template definitions & validation
// ─────────────────────────────────────────────────────────────────────────────
// The following code can be re-enabled if offline/client-side template
// generation or pre-upload header validation is needed in the future.
// The backend (CsvValidationHelper.java) is the authoritative source for
// required columns and field formats.
//
// export interface CsvTemplate {
//   headers: string[];
//   sampleRow: string[];
//   hintRow?: string[];
//   filename: string;
//   description: string;
// }
//
// export const STUDENT_CSV_TEMPLATE: CsvTemplate = {
//   filename: "students_template.csv",
//   description: "Student bulk import template",
//   headers: [
//     "firstName", "lastName", "middleName", "email", "dateOfBirth",
//     "rollNo", "gender", "enrollmentNumber", "enrollmentDate", "className", "sectionName",
//   ],
//   hintRow: [
//     "Text (required)", "Text (required)", "Text (optional)",
//     "email@example.com (required)", "yyyy-MM-dd e.g. 2010-05-15",
//     "Integer e.g. 1", "MALE / FEMALE / OTHER",
//     "Text e.g. EN2024001 (required)", "yyyy-MM-dd e.g. 2024-04-01",
//     "Class name e.g. 10 (required)", "Section e.g. A (required)",
//   ],
//   sampleRow: [
//     "Aarav", "Sharma", "", "aarav.sharma@school.edu", "2010-05-15",
//     "1", "MALE", "EN2024001", "2024-04-01", "10", "A",
//   ],
// };
//
// export const STAFF_CSV_TEMPLATE: CsvTemplate = {
//   filename: "staff_template.csv",
//   description: "Staff bulk import template",
//   headers: [
//     "firstName", "lastName", "middleName", "email", "dateOfBirth",
//     "gender", "employeeId", "joiningDate", "jobTitle", "department", "staffType",
//   ],
//   hintRow: [
//     "Text (required)", "Text (required)", "Text (optional)",
//     "email@example.com (required)", "yyyy-MM-dd e.g. 1985-08-20",
//     "MALE / FEMALE / OTHER", "Text e.g. EMP001 (required)",
//     "yyyy-MM-dd e.g. 2020-06-01", "Text e.g. Mathematics Teacher",
//     "Text e.g. Science", "TEACHER / PRINCIPAL / LIBRARIAN (required)",
//   ],
//   sampleRow: [
//     "Priya", "Verma", "", "priya.verma@school.edu", "1985-08-20",
//     "FEMALE", "EMP001", "2020-06-01", "Mathematics Teacher", "Science", "TEACHER",
//   ],
// };
//
// export function getTemplateForUserType(userType: "students" | "staff"): CsvTemplate {
//   return userType === "students" ? STUDENT_CSV_TEMPLATE : STAFF_CSV_TEMPLATE;
// }
//
// /** Validate uploaded CSV headers against the expected template. Returns error string or null. */
// export function validateCsvHeaders(uploadedHeaders: string[], template: CsvTemplate): string | null {
//   const required = new Set(template.headers);
//   const uploaded = new Set(uploadedHeaders.map((h) => h.trim()));
//   const missing = [...required].filter((h) => !uploaded.has(h));
//   if (missing.length > 0) {
//     return `Missing required columns: ${missing.join(", ")}`;
//   }
//   return null;
// }
//
// /** Client-side CSV generation fallback (used when backend endpoint is unavailable). */
// function _downloadClientSide(template: CsvTemplate): void {
//   const escapeCsv = (val: string) =>
//     val.includes(",") || val.includes('"') || val.includes("\n")
//       ? `"${val.replace(/"/g, '""')}"` : val;
//   const lines: string[] = [template.headers.map(escapeCsv).join(",")];
//   if (template.hintRow) lines.push(template.hintRow.map(escapeCsv).join(","));
//   lines.push(template.sampleRow.map(escapeCsv).join(","));
//   const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(lines.join("\r\n"));
//   const link = document.createElement("a");
//   link.setAttribute("href", dataUrl);
//   link.setAttribute("download", template.filename);
//   link.style.display = "none";
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }
