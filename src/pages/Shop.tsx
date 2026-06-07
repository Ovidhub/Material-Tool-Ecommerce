import { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { brands } from "../data/products";
import ProductCard from "../components/ProductCard";
import { categoryIconMap } from "../components/Icons";
import { useStore } from "../context/StoreContext";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const { state } = useStore();
  const products = state.products;
  const categories = state.categories;
  const q = params.get("q") || "", category = params.get("category") || "", brand = params.get("brand") || "", badge = params.get("badge") || "", sort = params.get("sort") || "featured";
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q) { const qL = q.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(qL) || p.brand.toLowerCase().includes(qL) || p.shortDesc.toLowerCase().includes(qL)); }
    if (category) list = list.filter((p) => p.category === category);
    if (brand) list = list.filter((p) => p.brand === brand);
    if (badge) list = list.filter((p) => p.badge === badge);
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sort) { case "price-asc": list.sort((a, b) => a.price - b.price); break; case "price-desc": list.sort((a, b) => b.price - a.price); break; case "rating": list.sort((a, b) => b.rating - a.rating); break; default: list.sort((a, b) => b.reviews - a.reviews); }
    return list;
  }, [q, category, brand, badge, sort, priceRange]);

  function setParam(k: string, v: string) { const p = new URLSearchParams(params); if (v) p.set(k, v); else p.delete(k); setParams(p); }
  function clearFilters() { setParams({}); setPriceRange([0, 500]); }

  if (state.loading && state.products.length === 0) {
    return <div className="max-w-7xl mx-auto px-4 py-24 text-center text-neutral-500">Loading products…</div>;
  }

  const activeFilters = [category, brand, badge, q].filter(Boolean).length;
  const currentCat = categories.find((c) => c.id === category);
  const CatIcon = currentCat ? categoryIconMap[currentCat.id] : null;

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase flex items-center gap-3">
              {CatIcon && <CatIcon className="w-7 h-7 text-red-500" />}
              {q ? `Search: "${q}"` : category ? currentCat?.name : badge === "Sale" ? "Hot Deals & Sales" : "All Products"}
            </h1>
            <div className="text-xs text-neutral-400 mt-1"><Link to="/" className="hover:text-red-500">Home</Link><span className="mx-1.5">/</span><span>Shop</span>{category && <><span className="mx-1.5">/</span><span className="text-white">{currentCat?.name}</span></>}</div>
          </div>
          <div className="text-sm text-neutral-400">{filtered.length} products found</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3 mb-5 bg-white border border-neutral-200 rounded-sm px-4 py-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden px-3 py-2 bg-neutral-100 text-[11px] font-bold uppercase rounded-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            FILTERS {activeFilters > 0 && `(${activeFilters})`}
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="px-3 py-2 bg-neutral-50 border border-neutral-200 text-[11px] font-bold uppercase rounded-sm focus:outline-none focus:border-red-500">
              <option value="featured">Sort: Popular</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="rating">Top Rated</option>
            </select>
            <div className="hidden md:flex border border-neutral-200 rounded-sm overflow-hidden">
              <button onClick={() => setView("grid")} className={`px-2.5 py-2 ${view === "grid" ? "bg-red-600 text-white" : "bg-white text-neutral-600"}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z"/></svg></button>
              <button onClick={() => setView("list")} className={`px-2.5 py-2 ${view === "list" ? "bg-red-600 text-white" : "bg-white text-neutral-600"}`}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/></svg></button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[230px_1fr] gap-6">
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-5 h-fit lg:sticky lg:top-40`}>
            <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
              <div className="bg-neutral-900 text-white px-4 py-3 flex items-center justify-between"><h3 className="text-[11px] font-black uppercase tracking-wider">Categories</h3>{category && <button onClick={() => setParam("category", "")} className="text-[9px] text-red-400 font-bold hover:underline">CLEAR</button>}</div>
              <div className="divide-y divide-neutral-100">
                {categories.map((c) => { const I = categoryIconMap[c.id]; return (
                  <button key={c.id} onClick={() => setParam("category", category === c.id ? "" : c.id)} className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition hover:bg-neutral-50 ${category === c.id ? "bg-red-50 text-red-600 font-bold" : "text-neutral-700"}`}>
                    <span className="flex items-center gap-2">{I ? <I className="w-4 h-4" /> : null}<span>{c.name}</span></span><span className="text-[10px] text-neutral-400">{c.count}</span>
                  </button>
                ); })}
              </div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
              <div className="bg-neutral-900 text-white px-4 py-3"><h3 className="text-[11px] font-black uppercase tracking-wider">Brands</h3></div>
              <div className="p-3 space-y-1">{brands.slice(0, 10).map((b) => (<label key={b} className="flex items-center gap-2 py-1 cursor-pointer group"><input type="checkbox" checked={brand === b} onChange={() => setParam("brand", brand === b ? "" : b)} className="w-3.5 h-3.5 accent-red-600 rounded-sm" /><span className={`text-xs group-hover:text-red-600 transition ${brand === b ? "text-red-600 font-bold" : "text-neutral-600"}`}>{b}</span></label>))}</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
              <div className="bg-neutral-900 text-white px-4 py-3"><h3 className="text-[11px] font-black uppercase tracking-wider">Price Range</h3></div>
              <div className="p-4"><div className="flex items-center justify-between text-xs font-bold text-neutral-700 mb-3"><span>${priceRange[0]}</span><span>${priceRange[1]}</span></div><input type="range" min={0} max={500} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-red-600" /></div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
              <div className="bg-neutral-900 text-white px-4 py-3"><h3 className="text-[11px] font-black uppercase tracking-wider">Specials</h3></div>
              <div className="p-3 flex flex-wrap gap-1.5">{["New", "Sale", "Hot", "Top"].map((b) => (<button key={b} onClick={() => setParam("badge", badge === b ? "" : b)} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition ${badge === b ? "bg-red-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}>{b}</button>))}</div>
            </div>
            {activeFilters > 0 && <button onClick={clearFilters} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition">CLEAR ALL FILTERS</button>}
          </aside>
          <main>
            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white border border-neutral-200 rounded-sm">
                <svg className="w-16 h-16 mx-auto text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">No products found</h3><p className="text-sm text-neutral-500 mb-4">Try adjusting your filters.</p>
                <button onClick={clearFilters} className="px-5 py-2 bg-red-600 text-white text-xs font-bold uppercase rounded-sm">Clear filters</button>
              </div>
            ) : (
              <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-3"}>{filtered.map((p) => <ProductCard key={p.id} product={p} view={view} />)}</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
