import { api } from "@/lib/axios";
import type { BulkImportReportDTO, BulkImportUserType } from "../types";

/**
 * Build the full SSE stream URL for a given sessionId.
 * Pattern: <baseURL without /api/v1> + /api/v1/bulk-import/stream/{sessionId}
 *
 * The backend SSE endpoint is NOT under /auth, so we reach it via the same
 * origin but with the explicit /api/v1 prefix.
 */
export function buildSseUrl(sessionId: string): string {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ??
    "http://localhost:8080";
  const prefix = (import.meta.env.VITE_API_PREFIX ?? "/api").replace(/\/+$/, "");
  const version = (import.meta.env.VITE_API_VERSION ?? "v1").replace(/^\/+/, "").replace(/\/+$/, "");
  return `${baseUrl}${prefix}/${version}/bulk-import/stream/${sessionId}`;
}

/**
 * Upload a spreadsheet file to the backend bulk-import endpoint.
 *
 * Endpoint: POST /api/v1/auth/bulk-import/{userType}
 * Content-Type: multipart/form-data
 * Header: X-Session-Id — ties this upload to the SSE stream with the same sessionId
 */
export async function submitBulkImport(
  file: File,
  userType: BulkImportUserType,
  sessionId: string
): Promise<BulkImportReportDTO> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<BulkImportReportDTO>(
    `/auth/bulk-import/${userType}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Session-Id": sessionId,
      },
    }
  );

  return response.data;
}
