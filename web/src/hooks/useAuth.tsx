import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getAuth } from "@/openapi";
import { Auth } from "@/openapi";

type AuthCtxValue = {
  authInProgress: boolean;
  isAuthed: boolean;
  userData: Auth | null;
  refreshAuth: () => Promise<void>;
  isIGStaff: boolean;
  isIGAdmin: boolean;
  isApprovedResearcher: boolean;
  isTreOpsStaff: boolean;
  isApprovedStaffResearcher: boolean;
  isAdmin: boolean;
  isIAO: boolean;
  isDSHOpsStaff: boolean;
};

const AuthCtx = createContext<AuthCtxValue>({
  authInProgress: true,
  isAuthed: false,
  userData: null,
  isIGStaff: false,
  isIGAdmin: false,
  isApprovedResearcher: false,
  isTreOpsStaff: false,
  isApprovedStaffResearcher: false,
  isIAO: false,
  isAdmin: false,
  isDSHOpsStaff: false,
  refreshAuth: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authInProgress, setAuthInProgress] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userData, setUserData] = useState<Auth | null>(null);

  const cancelled = useRef(false);
  const isAdmin = userData?.roles.includes("admin") ?? false;
  const isIGStaff = (userData?.roles.includes("ig-admin") || userData?.roles.includes("ig-ops-staff")) ?? false;
  const isIGAdmin = userData?.roles.includes("ig-admin") ?? false;
  const isTreOpsStaff = userData?.roles.includes("tre-ops-staff") ?? false;
  const isDSHOpsStaff = userData?.roles.includes("dsh-ops-staff") ?? false;
  const isApprovedResearcher = userData?.roles.includes("approved-researcher") ?? false;
  const isApprovedStaffResearcher = userData?.roles.includes("approved-staff-researcher") ?? false;
  const isIAO = userData?.roles.includes("information-asset-owner") ?? false;

  const refreshAuth = useCallback(async () => {
    try {
      const response = await getAuth();

      if (!cancelled.current && response.response && response.response.status === 200 && response.data) {
        setIsAuthed(true);
        setUserData(response.data);
      } else if (!cancelled.current) {
        setIsAuthed(false);
      }
    } catch (err) {
      if (!cancelled.current) {
        console.error("Profile fetch error:", err);
        setIsAuthed(false);
      }
    } finally {
      if (!cancelled.current) setAuthInProgress(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();

    return () => {
      cancelled.current = true;
    };
  }, [refreshAuth]);

  return (
    <AuthCtx.Provider
      value={{
        authInProgress,
        isAuthed,
        userData,
        refreshAuth,
        isAdmin,
        isIGStaff,
        isIGAdmin,
        isApprovedResearcher,
        isTreOpsStaff,
        isApprovedStaffResearcher,
        isIAO,
        isDSHOpsStaff,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
