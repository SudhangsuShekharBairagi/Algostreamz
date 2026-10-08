import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import authApi from "../services/authApi";
import tokenStore from "../services/tokenStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True until the stored token has been checked against /auth/me, so protected views
  // do not flash their signed-out state during a reload.
  const [initialising, setInitialising] = useState(Boolean(tokenStore.get()));

  const applySession = useCallback((session) => {
    tokenStore.set(session.token);
    setUser(session.user);
  }, []);

  const syncUser = useCallback((updatedUser) => {
    setUser((current) =>
      current ? { ...current, ...updatedUser } : updatedUser,
    );
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Tokens are stateless, so a failed call changes nothing locally. Clear anyway.
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  // Re-establish the session on reload, and drop it the moment the API rejects it.
  useEffect(() => {
    if (!tokenStore.get()) {
      setInitialising(false);
      return;
    }

    let cancelled = false;
    authApi
      .me()
      .then(({ data }) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        tokenStore.clear();
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitialising(false);
      });

    const onExpired = () => setUser(null);
    window.addEventListener("auth:expired", onExpired);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:expired", onExpired);
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      initialising,
      isAuthenticated: Boolean(user),
      /** The user has an account but has not confirmed their address yet. */
      needsVerification: Boolean(user && !user.emailVerified),
      register: (payload) =>
        authApi.register(payload).then(({ data }) => data.message),
      verifyEmail: (payload) =>
        authApi.verifyEmail(payload).then(({ data }) => applySession(data)),
      resendVerification: (email) =>
        authApi.resendVerification(email).then(({ data }) => data.message),
      login: (payload) =>
        authApi.login(payload).then(({ data }) => applySession(data)),
      requestLoginOtp: (email) =>
        authApi.requestLoginOtp(email).then(({ data }) => data.message),
      verifyLoginOtp: (payload) =>
        authApi.verifyLoginOtp(payload).then(({ data }) => applySession(data)),
      syncUser,
      signOut,
      refresh: () => authApi.me().then(({ data }) => setUser(data)),
    }),
    [user, initialising, applySession, signOut, syncUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}

export default AuthProvider;
