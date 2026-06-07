import { Link } from "react-router-dom";
import { brands } from "../data/products";
import { useStore } from "../context/StoreContext";
import { categoryIconMap, MapPinIcon, PhoneIcon, MailIcon } from "./Icons";

export default function Footer() {
  const { state } = useStore();
  const categories = state.categories;
  const site = state.siteContent;
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="bg-red-600">
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-5 items-center">
          <div className="text-white"><h3 className="text-lg font-black uppercase">{site.newsletterTitle}</h3><p className="text-xs text-red-200 mt-1">{site.newsletterSubtitle}</p></div>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-0">
            <input type="email" placeholder="Enter your email address" className="flex-1 px-4 py-3 bg-red-700 border border-red-500 text-white placeholder-red-300 text-sm focus:outline-none focus:bg-red-800 rounded-l-sm" />
            <button className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition rounded-r-sm">SUBSCRIBE</button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded grid place-items-center overflow-hidden" style={{ backgroundColor: site.logoBoxColor }}>{site.logoUrl ? <img src={site.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>}</div>
            <div><span className="font-black text-lg text-white">{site.brandName}</span><span className="font-black text-lg text-red-500">{site.brandAccent}</span></div>
          </div>
          <p className="text-xs leading-relaxed mb-5">{site.footerDescription}</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2"><MapPinIcon className="w-3.5 h-3.5 text-red-500 shrink-0" /><span>{site.address}, {site.cityLine}</span></div>
            <div className="flex items-center gap-2"><PhoneIcon className="w-3.5 h-3.5 text-red-500 shrink-0" /><span>{site.phone}</span></div>
            <div className="flex items-center gap-2"><MailIcon className="w-3.5 h-3.5 text-red-500 shrink-0" /><span>{site.email}</span></div>
          </div>
        </div>
        <div>
          <h4 className="font-black text-white text-[11px] uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            {[{l:"About Us",t:"/about"},{l:"Shop All",t:"/shop"},{l:"Top Deals",t:"/shop?badge=Sale"},{l:"Contact Us",t:"/contact"},{l:"My Account",t:"/login"},{l:"Shipping Policy",t:"#"},{l:"Returns",t:"#"}].map((i)=>(<li key={i.l}><Link to={i.t} className="hover:text-red-500 transition">{i.l}</Link></li>))}
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white text-[11px] uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">Categories</h4>
          <ul className="space-y-2 text-xs">{categories.slice(0, 8).map((c) => { const I = categoryIconMap[c.id]; return (<li key={c.id}><Link to={`/shop?category=${c.id}`} className="hover:text-red-500 transition flex items-center gap-1.5">{I && <I className="w-3 h-3" />}{c.name}</Link></li>);})}</ul>
        </div>
        <div>
          <h4 className="font-black text-white text-[11px] uppercase tracking-wider mb-4 pb-2 border-b border-neutral-800">Popular Brands</h4>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">{brands.slice(0, 10).map((b) => (<Link key={b} to={`/shop?brand=${b}`} className="hover:text-red-500 transition">{b}</Link>))}</div>
          <h4 className="font-black text-white text-[11px] uppercase tracking-wider mt-6 mb-3 pb-2 border-b border-neutral-800">We Accept</h4>
          <div className="flex gap-2">{["VISA", "MC", "AMEX", "PP"].map((c) => (<span key={c} className="px-2.5 py-1.5 bg-neutral-800 rounded text-[9px] font-bold text-neutral-400 tracking-wider">{c}</span>))}</div>
        </div>
      </div>
      <div className="border-t border-neutral-800"><div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-[11px] text-neutral-500"><span>&copy; {new Date().getFullYear()} {site.brandName}{site.brandAccent} Material Tools Co. All rights reserved.</span><div className="flex gap-4"><a href="#" className="hover:text-red-500 transition">Privacy Policy</a><a href="#" className="hover:text-red-500 transition">Terms of Service</a></div></div></div>
    </footer>
  );
}
