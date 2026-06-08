import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { categoryIconMap } from "./Icons";

export default function Header() {
  const { cartCount, cartSubtotal, state } = useStore();
  const categories = state.categories;
  const site = state.siteContent;
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [catDropdown, setCatDropdown] = useState(false);
  const nav = useNavigate();

  function onSearch(e: React.FormEvent) { e.preventDefault(); if (search.trim()) { nav(`/shop?q=${encodeURIComponent(search.trim())}`); setSearch(""); setMenuOpen(false); } }

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-neutral-900 text-neutral-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <span>{site.promoText} · <span className="text-red-500 font-bold">{site.promoCode}</span> · <Link to="/shop?badge=Sale" className="text-yellow-400 hover:underline font-semibold">SHOP NOW</Link></span>
          <div className="hidden md:flex items-center gap-5">
            <Link to="/account" className="hover:text-white transition">Order Tracking</Link>
            <Link to="/contact" className="hover:text-white transition">Help Center</Link>
            <span>English</span><span>$ USD</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-[70px] flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-4">
            {site.logoUrl ? (
              <img src={site.logoUrl} alt="Logo" className="h-10 w-auto max-w-[160px] object-contain" />
            ) : (
              <div className="w-9 h-9 rounded grid place-items-center overflow-hidden" style={{ backgroundColor: site.logoBoxColor }}>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              </div>
            )}
            <div className="leading-tight hidden sm:block"><span className="font-black text-xl text-neutral-900 tracking-tight">{site.brandName}</span><span className="font-black text-xl text-red-600 tracking-tight">{site.brandAccent}</span></div>
          </Link>

          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full border border-neutral-300 rounded overflow-hidden">
              <div className="relative">
                <button type="button" onClick={() => setCatDropdown(!catDropdown)} className="h-full px-3 bg-neutral-100 border-r border-neutral-300 text-xs font-semibold text-neutral-700 whitespace-nowrap flex items-center gap-1">All Categories <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg></button>
                {catDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 rounded shadow-xl z-50 animate-slideDown max-h-64 overflow-auto">
                    {categories.map((c) => { const I = categoryIconMap[c.id]; return (
                      <Link key={c.id} to={`/shop?category=${c.id}`} onClick={() => setCatDropdown(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600 transition">
                        {I ? <I className="w-4 h-4" /> : null} {c.name}
                      </Link>
                    ); })}
                  </div>
                )}
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products here..." className="flex-1 px-4 py-2.5 text-sm focus:outline-none" />
              <button type="submit" className="px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> SEARCH
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            <span className="hidden lg:flex items-center gap-1 text-xs text-neutral-500 mr-3">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              {site.phone}
            </span>
            <Link to={state.user ? "/account" : "/login"} className="p-2 hover:bg-neutral-100 rounded transition">
              {state.user ? (<div className="w-7 h-7 rounded-full bg-red-600 grid place-items-center text-white text-xs font-bold">{state.user.name[0]}</div>) : (<svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>)}
            </Link>
            <Link to="/wishlist" className="p-2 hover:bg-neutral-100 rounded transition relative hidden sm:flex">
              <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              {state.wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 grid place-items-center">{state.wishlist.length}</span>}
            </Link>
            <Link to="/cart" className="p-2 hover:bg-neutral-100 rounded transition relative flex items-center gap-2">
              <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
              {cartCount > 0 && <span className="absolute -top-0.5 right-8 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 grid place-items-center">{cartCount}</span>}
              <div className="hidden lg:block text-left"><div className="text-[10px] text-neutral-500">My Cart</div><div className="text-xs font-bold text-neutral-900">${cartSubtotal.toFixed(2)}</div></div>
            </Link>
            <button className="lg:hidden p-2 hover:bg-neutral-100 rounded" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>{menuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg>
            </button>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="bg-red-600 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-12">
          <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
            <button className="bg-red-700 hover:bg-red-800 px-5 h-12 flex items-center gap-2 text-white text-sm font-bold transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              SHOP BY CATEGORIES
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </button>
            {catOpen && (
              <div className="absolute top-full left-0 w-60 bg-white border border-neutral-200 shadow-xl z-50 animate-slideDown">
                {categories.map((c) => { const I = categoryIconMap[c.id]; return (
                  <Link key={c.id} to={`/shop?category=${c.id}`} onClick={() => setCatOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-red-50 hover:text-red-600 border-b border-neutral-100 transition">
                    {I ? <I className="w-4 h-4" /> : null}<span>{c.name}</span>
                    <svg className="w-3 h-3 ml-auto text-neutral-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
                  </Link>
                ); })}
              </div>
            )}
          </div>
          <nav className="flex items-center gap-0 ml-2">
            {[{ to: "/", label: "Home" }, { to: "/shop", label: "Shop" }, { to: "/shop?category=power-tools", label: "Products", badge: "NEW" }, { to: "/shop?badge=Sale", label: "Top Deals", badge: "HOT" }, { to: "/about", label: "About" }, { to: "/contact", label: "Contact" }].map((link) => (
              <NavLink key={link.label} to={link.to} className={({ isActive }) => `px-4 h-12 flex items-center gap-1.5 text-sm font-semibold transition ${isActive ? "bg-red-700 text-white" : "text-white/90 hover:bg-red-700 hover:text-white"}`} end={link.to === "/"}>
                {link.label}{link.badge && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${link.badge === "HOT" ? "bg-yellow-400 text-neutral-900" : "bg-green-500 text-white"}`}>{link.badge}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 shadow-lg animate-slideDown">
          <form onSubmit={onSearch} className="p-3 border-b border-neutral-200"><div className="flex border border-neutral-300 rounded overflow-hidden"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="flex-1 px-3 py-2.5 text-sm" /><button type="submit" className="px-4 bg-red-600 text-white text-sm font-bold">GO</button></div></form>
          <nav className="flex flex-col">
            {["/", "/shop", "/shop?badge=Sale", "/about", "/contact"].map((path, i) => (<Link key={path} to={path} onClick={() => setMenuOpen(false)} className="px-4 py-3 font-semibold border-b border-neutral-100 hover:bg-neutral-50">{["Home", "Shop", "Top Deals", "About", "Contact"][i]}</Link>))}
            <div className="p-3 border-t border-neutral-200"><div className="text-xs font-bold uppercase text-neutral-500 mb-2">Categories</div>{categories.slice(0, 8).map((c) => {const I = categoryIconMap[c.id]; return (<Link key={c.id} to={`/shop?category=${c.id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:text-red-600">{I ? <I className="w-3.5 h-3.5" /> : null} {c.name}</Link>);})}</div>
          </nav>
        </div>
      )}
    </header>
  );
}
