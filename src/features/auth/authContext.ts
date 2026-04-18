import { createContext } from "react";
import type { AuthResponse, UserProfile } from "../../types";

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
