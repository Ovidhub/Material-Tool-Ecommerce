import { useState } from "react";
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from "../components/Icons";
import { useStore } from "../context/StoreContext";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const { state } = useStore();
  const site = state.siteContent;
  function submit(e: React.FormEvent) { e.preventDefault(); setSent(true); setForm({ name: "", email: "", subject: "", message: "" }); setTimeout(() => setSent(false), 4000); }
  const inputCls = "w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500 bg-white";

  return (
    <div className="bg-neutral-50">
      <section className="bg-neutral-900 text-white py-12"><div className="max-w-7xl mx-auto px-4 text-center"><div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Get In Touch</div><h1 className="text-3xl md:text-4xl font-black mb-3">We'd Love To Hear From You</h1><p className="text-neutral-400 max-w-xl mx-auto text-sm">Questions about an order? Need a product recommendation? Our team is ready to help.</p></div></section>

      <section className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-4 -mt-12">
        {[{ Icon: PhoneIcon, title: "Call Us", l1: site.phone, l2: site.hours }, { Icon: MailIcon, title: "Email Us", l1: site.email, l2: "Reply within 2 hours" }, { Icon: MapPinIcon, title: "Visit Us", l1: site.address, l2: site.cityLine }].map((c, i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-sm p-5 text-center shadow">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 grid place-items-center mx-auto mb-3"><c.Icon className="w-5 h-5 text-red-600" /></div>
            <h3 className="font-bold text-neutral-900 text-sm mb-1">{c.title}</h3><div className="text-xs font-semibold text-neutral-900">{c.l1}</div><div className="text-xs text-neutral-500">{c.l2}</div>
          </div>
        ))}
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-black text-neutral-900 uppercase mb-4">Send A Message</h2>
            {sent && <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-xs text-green-700 mb-4 flex items-center gap-2"><svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Message sent! We'll be in touch shortly.</div>}
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Name</label><input required className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Email</label><input type="email" required className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Subject</label><input required className={inputCls} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} /></div>
              <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Message</label><textarea required rows={5} className={inputCls} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} /></div>
              <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase tracking-wider rounded-sm transition">Send Message</button>
            </form>
          </div>
          <div className="bg-neutral-900 text-white rounded-sm overflow-hidden">
            <div className="p-5 space-y-4">
              <h3 className="font-bold mb-1">Flagship Store</h3>
              <div className="flex gap-2 text-sm"><MapPinIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><div><div className="font-semibold text-xs">Headquarters</div><div className="text-neutral-400 text-xs">{site.address}, {site.cityLine}</div></div></div>
              <div className="flex gap-2 text-sm"><ClockIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><div><div className="font-semibold text-xs">Store Hours</div><div className="text-neutral-400 text-xs">{site.hours}</div></div></div>
            </div>
            <div className="h-48 bg-gradient-to-br from-red-700 to-red-900 grid place-items-center relative overflow-hidden"><MapPinIcon className="w-12 h-12 text-white/30 absolute" /><div className="relative text-center"><MapPinIcon className="w-8 h-8 text-white mx-auto mb-1" /><div className="font-bold text-sm">{site.brandName}{site.brandAccent} HQ</div><div className="text-[10px] opacity-70">{site.cityLine}</div></div></div>
          </div>
        </div>
      </section>
    </div>
  );
}
