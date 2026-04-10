import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = `http://${process.env.EXPO_PUBLIC_DOMAIN}`;

async function apiPost(path: string, body: object, token?: string) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setBaseUrl(API_BASE);
    // ✅ FIXED: Promise resolve karo
    setAuthTokenGetter(() => Promise.resolve(token));
  }, [token]);

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem("auth_token");
        const savedUser = await AsyncStorage.getItem("auth_user");
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiPost("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem("auth_token", data.token);
    await AsyncStorage.setItem("auth_user", JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string, role = "admin") => {
    const data = await apiPost("/auth/register", { name, email, password, role });
    setToken(data.token);
    setUser(data.user);
    await AsyncStorage.setItem("auth_token", data.token);
    await AsyncStorage.setItem("auth_user", JSON.stringify(data.user));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}