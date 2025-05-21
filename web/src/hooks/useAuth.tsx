import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "@/openapi";
import { ProfileResponse } from "@/openapi";

type AuthCtxValue = {
  loading: boolean;
  isAuthed: boolean;
  userData: ProfileResponse | null;
};

const AuthCtx = createContext<AuthCtxValue>({
  loading: true,
  isAuthed: false,
  userData: null,
});

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userData, setUserData] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const response = await getProfile();

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
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  return <AuthCtx.Provider value={{ loading, isAuthed, userData }}>{children}</AuthCtx.Provider>;
}
