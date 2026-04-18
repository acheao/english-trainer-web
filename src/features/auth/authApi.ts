import { apiFetch } from "../../shared/api/client";
import type { AuthResponse, UserProfile } from "../../types";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName?: string;
  dailyGoalMinutes?: number;
  targetIeltsScore?: number;
};

export type UpdateProfileRequest = {
  displayName?: string;
  dailyGoalMinutes?: number;
  targetIeltsScore?: number;
};

export const authApi = {
  login: (payload: LoginRequest) => apiFetch<AuthResponse>("/api/auth/login", { method: "POST", json: payload }),
  register: (payload: RegisterRequest) =>
    apiFetch<AuthResponse>("/api/auth/register", { method: "POST", json: payload }),
  me: () => apiFetch<UserProfile>("/api/auth/me"),
  updateProfile: (payload: UpdateProfileRequest) =>
    apiFetch<UserProfile>("/api/auth/profile", { method: "PATCH", json: payload }),
};
