import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import { PackageIcon, HeartIcon, StarIcon } from "../components/Icons";

export default function Account() {
  const { state, logout, changePassword } = useStore();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);
  const pwInput = "w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500";

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next.length < 6) { setPwMsg({ ok: false, text: "New password must be at least 6 characters." }); return; }
    if (pw.next !== pw.confirm) { setPwMsg({ ok: false, text: "New passwords do not match." }); return; }
    setPwBusy(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ ok: true, text: "Password updated successfully." });
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : "Could not update password." });
    } finally {
      setPwBusy(false);
    }
  }

  if (!state.user) return (<div className="max-w-2xl mx-auto px-4 py-24 text-center"><svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg><h1 className="text-2xl font-black mb-3">Sign in to your account</h1><Link to="/login" className="inline-block px-6 py-3 bg-red-600 text-white text-sm font-bold rounded-sm">Sign In</Link></div>);
  const wishedProducts = state.products.filter((p) => state.wishlist.includes(p.id));
  const kpis = [
    { label: "Total Orders", value: state.orders.length, Icon: PackageIcon, bg: "bg-red-600" },
    { label: "Wishlist Items", value: state.wishlist.length, Icon: HeartIcon, bg: "bg-neutral-900" },
    { label: "Loyalty Points", value: 1240, Icon: StarIcon, bg: "bg-yellow-500" },
  ];
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-200">
          <div className="w-16 h-16 rounded bg-red-600 grid place-items-center text-white text-2xl font-black">{state.user.name[0]}</div>
          <div className="flex-1"><h1 className="text-2xl font-black text-neutral-900">Hi, {state.user.name}!</h1><p className="text-sm text-neutral-500">{state.user.email} · {state.user.role === "admin" ? "Admin" : "Customer"}</p></div>
          <button onClick={() => { logout(); }} className="px-4 py-2 border border-neutral-300 text-xs font-bold rounded-sm hover:bg-neutral-100 flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>SIGN OUT</button>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {kpis.map((s, i) => (<div key={i} className={`${s.bg} text-white rounded-sm p-5`}><s.Icon className="w-6 h-6 mb-2 opacity-80" /><div className="text-2xl font-black">{s.value}</div><div className="text-xs opacity-80">{s.label}</div></div>))}
        </div>
        <section className="mb-10">
          <h2 className="text-lg font-black text-neutral-900 uppercase mb-4 pb-2 border-b-[3px] border-red-600 inline-block">Recent Orders</h2>
          {state.orders.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-sm p-10 text-center"><PackageIcon className="w-12 h-12 mx-auto text-neutral-300 mb-3" /><p className="text-sm text-neutral-500 mb-3">No orders yet.</p><Link to="/shop" className="inline-block px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-sm">Browse Products</Link></div>
          ) : (
            <div className="space-y-2">{state.orders.map((o) => (<div key={o.id} className="bg-white border border-neutral-200 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3"><div><div className="font-bold text-neutral-900 text-sm">Order #{o.id}</div><div className="text-[11px] text-neutral-500">{new Date(o.date).toLocaleDateString()} · {o.items.length} items</div></div><div className="flex items-center gap-3"><span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-sm text-[10px] font-bold">{o.status}</span><span className="font-bold">${o.total.toFixed(2)}</span></div></div>))}</div>
          )}
        </section>
        <section className="mb-10 max-w-lg">
          <h2 className="text-lg font-black text-neutral-900 uppercase mb-4 pb-2 border-b-[3px] border-red-600 inline-block">Change Password</h2>
          <form onSubmit={submitPassword} className="bg-white border border-neutral-200 rounded-sm p-5 space-y-3">
            {pwMsg && <div className={`text-xs rounded-sm p-2.5 ${pwMsg.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{pwMsg.text}</div>}
            <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Current Password</label><input type="password" required autoComplete="current-password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} className={pwInput} /></div>
            <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">New Password</label><input type="password" required minLength={6} autoComplete="new-password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className={pwInput} /></div>
            <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Confirm New Password</label><input type="password" required autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} className={pwInput} /></div>
            <button type="submit" disabled={pwBusy} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition">{pwBusy ? "Updating…" : "Update Password"}</button>
          </form>
        </section>
        {wishedProducts.length > 0 && (<section><h2 className="text-lg font-black text-neutral-900 uppercase mb-4 pb-2 border-b-[3px] border-red-600 inline-block">Wishlist</h2><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{wishedProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>)}
      </div>
    </div>
  );
}
