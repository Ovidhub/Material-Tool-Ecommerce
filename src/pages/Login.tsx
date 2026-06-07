import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useStore();
  const nav = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = mode === "login"
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);
      nav(user.role === "customer" ? "/account" : "/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12 bg-neutral-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded bg-red-600 grid place-items-center"><svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></div>
            <div><span className="font-black text-xl text-neutral-900">TOOL</span><span className="font-black text-xl text-red-600">RACK</span></div>
          </div>
          <h1 className="text-2xl font-black text-neutral-900">{mode === "login" ? "Welcome Back" : "Create Account"}</h1>
        </div>
        <div className="bg-white border border-neutral-200 rounded-sm p-6 shadow">
          <div className="flex gap-0 mb-5 bg-neutral-100 p-1 rounded-sm">
            <button type="button" onClick={() => setMode("login")} className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-sm transition ${mode === "login" ? "bg-red-600 text-white" : "text-neutral-600"}`}>Sign In</button>
            <button type="button" onClick={() => setMode("register")} className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-sm transition ${mode === "register" ? "bg-red-600 text-white" : "text-neutral-600"}`}>Register</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (<div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Full Name</label><input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500" /></div>)}
            <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Email</label><input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500" placeholder="you@example.com" /></div>
            <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Password</label><input type="password" required minLength={6} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500" placeholder="••••••••" /></div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-sm px-3 py-2.5 text-xs font-medium">{error}</div>}
            <button type="submit" disabled={submitting} className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm uppercase tracking-wider rounded-sm transition">
              {submitting ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
          {mode === "login" && (
            <div className="mt-3 text-center">
              <Link to="/forgot-password" className="text-xs font-semibold text-red-600 hover:text-red-700">Forgot your password?</Link>
            </div>
          )}
          <div className="mt-4 bg-neutral-50 border border-neutral-200 rounded-sm p-3 text-[11px] text-neutral-500"><b className="text-neutral-700">Demo:</b> Use <code className="text-red-600">super@toolrack.com</code> for super admin, <code className="text-red-600">admin@toolrack.com</code> for admin.</div>
        </div>
      </div>
    </div>
  );
}
