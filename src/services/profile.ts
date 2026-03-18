import { api } from "@/lib/axios";
import type {
  UserProfileUpdateDTO,
  UserProfileDTO,
  ComprehensiveUserProfileResponseDTO,
} from "./types/profile";

// ── Profile Service ──────────────────────────────────────────────────

export const profileService = {
  /** GET /profile/me */
  getMyProfile() {
    return api.get<ComprehensiveUserProfileResponseDTO>("/profile/me");
  },

  /** PUT /profile/me */
  updateMyProfile(data: UserProfileUpdateDTO) {
    return api.put<UserProfileDTO>("/profile/me", data);
  },

  /** GET /profile/:userId (admin) */
  getProfileByUserId(userId: number) {
    return api.get<ComprehensiveUserProfileResponseDTO>(`/profile/${userId}`);
  },

  /** PUT /profile/:userId (admin) */
  updateProfileByUserId(userId: number, data: UserProfileUpdateDTO) {
    return api.put<UserProfileDTO>(`/profile/${userId}`, data);
  },
};
