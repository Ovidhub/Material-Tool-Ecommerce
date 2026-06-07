import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputCls = "w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500";
  const invalidLink = !email || !token;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.next.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (pw.next !== pw.confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const m = await resetPassword(email, token, pw.next);
      setDone(m);
      setTimeout(() => nav("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password. The link may have expired — request a new one.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12 bg-neutral-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-6"><h1 className="text-2xl font-black text-neutral-900">Reset Password</h1></div>
        <div className="bg-white border border-neutral-200 rounded-sm p-6 shadow">
          {invalidLink ? (
            <div className="text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-sm p-3 text-sm text-red-700">This reset link is invalid or incomplete.</div>
              <Link to="/forgot-password" className="inline-block px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-sm">Request a New Link</Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-sm text-green-700">{done}</div>
              <p className="text-xs text-neutral-500">Redirecting you to sign in…</p>
              <Link to="/login" className="inline-block px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-sm">Sign In Now</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="text-xs text-neutral-500">Resetting password for <span className="font-semibold text-neutral-800">{email}</span></div>
              {error && <div className="bg-red-50 border border-red-200 rounded-sm p-2.5 text-xs text-red-700">{error}</div>}
              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">New Password</label>
                <input type="password" required minLength={6} autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Confirm New Password</label>
                <input type="password" required autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} className={inputCls} />
              </div>
              <button type="submit" disabled={busy} className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm uppercase tracking-wider rounded-sm transition">
                {busy ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
