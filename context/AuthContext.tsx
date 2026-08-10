import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth } from "../lib/api";
import type { Profile } from "../lib/types";

type AuthValue = {
  user: Profile | null;
  loading: boolean;
  signUp: (n: string, e: string, p: string, r?: Profile["role"]) => Promise<string | null>;
  signIn: (e: string, p: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const session = await auth.getSession();
    setUser(session);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const session = await auth.getSession();
      if (alive) {
        setUser(session);
        setLoading(false);
      }
    })();
    const unsub = auth.onChange(() => void refresh());
    return () => {
      alive = false;
      unsub();
    };
  }, [refresh]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      async signUp(name, email, password, role = "tenant") {
        const res = await auth.signUp(name, email, password, role);
        if (res.error) return res.error;
        setUser(res.data);
        return null;
      },
      async signIn(email, password) {
        const res = await auth.signIn(email, password);
        if (res.error) return res.error;
        setUser(res.data);
        return null;
      },
      async signOut() {
        await auth.signOut();
        setUser(null);
      },
      refresh,
    }),
    [user, loading, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
