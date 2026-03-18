// ── Auth DTOs ────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserDetailsDto {
  userId: number;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userDetailsDto: UserDetailsDto;
  roles: string[];
  requiresPasswordChange: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
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

export interface MeResponse {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  profileId: number;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "NON_BINARY" | "OTHER" | "PREFER_NOT_TO_SAY";
  addresses?: AddressDTO[];
}
