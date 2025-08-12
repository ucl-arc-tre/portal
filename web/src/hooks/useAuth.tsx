import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getAuth } from "@/openapi";
import { Auth } from "@/openapi";

type AuthCtxValue = {
  authInProgress: boolean;
  isAuthed: boolean;
  userData: Auth | null;
  refreshAuth: () => Promise<void>;
};

const AuthCtx = createContext<AuthCtxValue>({
  authInProgress: true,
  isAuthed: false,
  userData: null,
  refreshAuth: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authInProgress, setAuthInProgress] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userData, setUserData] = useState<Auth | null>(null);

  const cancelled = useRef(false);
  const refreshAuth = async () => {
    try {
      const response = await getAuth();

      if (!cancelled.current && response.response.status === 200 && response.data) {
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
  };

  useEffect(() => {
    refreshAuth();

    return () => {
      cancelled.current = true;
    };
  }, []);

  return <AuthCtx.Provider value={{ authInProgress, isAuthed, userData, refreshAuth }}>{children}</AuthCtx.Provider>;
}
