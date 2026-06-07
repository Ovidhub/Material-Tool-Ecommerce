import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const m = await forgotPassword(email);
      setMsg(m);
    } catch {
      // Even on error we show the generic message (no account enumeration).
      setMsg("If an account exists for that email, a password reset link has been sent.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500";

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12 bg-neutral-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-neutral-900">Forgot Password</h1>
          <p className="text-sm text-neutral-500 mt-1">Enter your email and we'll send you a reset link.</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-sm p-6 shadow">
          {msg ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-sm text-green-700">{msg}</div>
              <p className="text-xs text-neutral-500">Check your inbox (and spam folder) for the reset link.</p>
              <Link to="/login" className="inline-block px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-sm">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={busy} className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm uppercase tracking-wider rounded-sm transition">
                {busy ? "Sending…" : "Send Reset Link"}
              </button>
              <div className="text-center"><Link to="/login" className="text-xs text-neutral-500 hover:text-red-600">Back to Sign In</Link></div>
            </form>
          )}
          <div className="mt-4 text-[11px] text-neutral-400 text-center">Password reset is available for customer accounts.</div>
        </div>
      </div>
    </div>
  );
}
