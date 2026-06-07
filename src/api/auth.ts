import { api, setToken } from "./client";
import type { User } from "./types";

type AuthResponse = { token: string; user: User };

export async function login(email: string, password: string): Promise<User> {
  const r = await api<AuthResponse>("/login", { method: "POST", body: JSON.stringify({ email, password }) });
  setToken(r.token);
  return r.user;
}
export async function register(name: string, email: string, password: string): Promise<User> {
  const r = await api<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, password_confirmation: password }),
  });
  setToken(r.token);
  return r.user;
}
export async function logout(): Promise<void> {
  try { await api("/logout", { method: "POST" }); } finally { setToken(null); }
}
export async function me(): Promise<User | null> {
  try { return await api<User>("/user"); } catch { setToken(null); return null; }
}
export async function forgotPassword(email: string): Promise<string> {
  const r = await api<{ message: string }>("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return r.message;
}
export async function resetPassword(email: string, token: string, newPassword: string): Promise<string> {
  const r = await api<{ message: string }>("/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, token, password: newPassword, password_confirmation: newPassword }),
  });
  return r.message;
}
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api("/user/password", {
    method: "POST",
    body: JSON.stringify({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword,
    }),
  });
}
