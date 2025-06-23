import { createContext, useContext, useEffect, useState } from "react";
import { getAuth } from "@/openapi";
import { Auth } from "@/openapi";

type AuthCtxValue = {
  authInProgress: boolean;
  isAuthed: boolean;
  userData: Auth | null;
};

const AuthCtx = createContext<AuthCtxValue>({
  authInProgress: true,
  isAuthed: false,
  userData: null,
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authInProgress, setAuthInProgress] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userData, setUserData] = useState<Auth | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const response = await getAuth();

        if (!cancelled && response.response.status === 200 && response.data) {
          setIsAuthed(true);
          setUserData(response.data);
        } else if (!cancelled) {
          setIsAuthed(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Profile fetch error:", err);
          setIsAuthed(false);
        }
      } finally {
        if (!cancelled) setAuthInProgress(false);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  return <AuthCtx.Provider value={{ authInProgress, isAuthed, userData }}>{children}</AuthCtx.Provider>;
}
