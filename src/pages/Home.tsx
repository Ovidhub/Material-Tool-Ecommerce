import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { brands } from "../data/products";
import ProductCard, { Stars } from "../components/ProductCard";
import { categoryIconMap, GlobeIcon, DollarIcon, TagIcon, HeadphonesIcon, StarIcon } from "../components/Icons";
import { useStore } from "../context/StoreContext";

const heroSlides = [
  { subtitle: "ALL THE PARTS YOU NEED", title: "INGCO ID6808", title2: "IMPACT DRILL", price: "$65.99", buttonText: "SHOP NOW", link: "/product/ingco-id6808-impact-drill", image: "https://images.pexels.com/photos/8811529/pexels-photo-8811529.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", brand: "Ronix" },
  { subtitle: "PROFESSIONAL GRADE", title: "BOSCH GKS 235", title2: "TURBO CIRCULAR", price: "$185.00", buttonText: "SHOP NOW", link: "/product/bosch-gks-235-turbo-circular-saw", image: "https://images.pexels.com/photos/5846253/pexels-photo-5846253.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", brand: "Bosch" },
  { subtitle: "UP TO 30% OFF", title: "DEWALT DW715", title2: "MITER SAW", price: "$259.00", buttonText: "SHOP NOW", link: "/product/dewalt-dw715-miter-saw", image: "https://images.pexels.com/photos/5414384/pexels-photo-5414384.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", brand: "DeWalt" },
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("power-tools");
  const { state } = useStore();
  const products = state.products;
  const categories = state.categories;
  const site = state.siteContent;
  const activeHeroSlides = state.siteContent.heroSlides.length ? state.siteContent.heroSlides : heroSlides;

  useEffect(() => { const t = setInterval(() => setSlide((s) => (s + 1) % activeHeroSlides.length), 5000); return () => clearInterval(t); }, [activeHeroSlides.length]);

  const trendingTabs = [
    { id: "power-tools", label: "POWER TOOLS" },
    { id: "drills", label: "HAND TOOLS" },
    { id: "hammer-tools", label: "HAMMER TOOLS" },
  ];

  const trendingProducts = products.filter((p) => p.category === activeTab || p.subcategory.toLowerCase().includes(activeTab.replace("-", " "))).slice(0, 10);
  const displayProducts = trendingProducts.length > 0 ? trendingProducts : products.slice(0, 10);
  const saleProducts = products.filter((p) => p.badge === "Sale" || p.oldPrice).slice(0, 5);
  const hotProducts = products.filter((p) => p.badge === "Hot" || p.rating === 5).slice(0, 6);
  const newProducts = products.filter((p) => p.badge === "New" || p.badge === "Top").slice(0, 4);
  const current = activeHeroSlides[slide] || activeHeroSlides[0];

  const [timer, setTimer] = useState({ d: 12, h: 8, m: 45, s: 30 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => { let { d, h, m, s } = t; s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; d--; } if (d < 0) { d = 0; h = 0; m = 0; s = 0; } return { d, h, m, s }; });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const trustIcons = [GlobeIcon, DollarIcon, TagIcon, HeadphonesIcon];
  const trustItems = site.trustItems.map((item, index) => ({ ...item, Icon: trustIcons[index] || HeadphonesIcon }));

  return (
    <div className="bg-neutral-100">
      {/* HERO */}
      <section className="relative bg-neutral-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20"><img src={current.image} alt="" className="w-full h-full object-cover blur-sm" /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-900/60" />
        <div className="relative max-w-7xl mx-auto px-4 grid md:grid-cols-2 items-center min-h-[440px]">
          <div className="py-14 md:py-0">
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1 rounded text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-4">{current.subtitle}</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-1">{current.title}</h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-red-500 leading-tight mb-2">{current.title2}</h2>
            <div className="text-2xl font-black text-yellow-400 mb-6">From {current.price}</div>
            <div className="flex flex-wrap gap-3">
              <Link to={current.link} className="inline-flex items-center gap-2 px-7 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-sm transition shadow-lg shadow-red-900/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                {current.buttonText}
              </Link>
              <Link to="/shop" className="inline-flex items-center gap-2 px-7 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider rounded-sm transition border border-white/20">VIEW ALL</Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center items-center py-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-3xl" />
              <img key={slide} src={current.image} alt="Featured" className="relative w-[420px] h-[340px] object-cover rounded-lg shadow-2xl animate-fadeInUp" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded shadow text-xs font-black text-neutral-900">{current.brand}</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {activeHeroSlides.map((_, i) => (<button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${i === slide ? "bg-red-600 w-8" : "bg-white/30 hover:bg-white/50 w-2"}`} />))}
        </div>
        <button onClick={() => setSlide((s) => (s - 1 + activeHeroSlides.length) % activeHeroSlides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={() => setSlide((s) => (s + 1) % activeHeroSlides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M9 5l7 7-7 7" /></svg></button>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-wide">{site.homeCategoryTitle}</h2>
          <div className="w-16 h-1 bg-red-600 mx-auto mt-3 rounded-full" />
          <p className="text-sm text-neutral-500 mt-3">{site.homeCategorySubtitle}</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
          {categories.map((c) => {
            const IconComp = categoryIconMap[c.id];
            return (
              <Link key={c.id} to={`/shop?category=${c.id}`} className="group flex flex-col items-center gap-2.5 py-5 px-2 bg-white rounded hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-neutral-50 group-hover:bg-red-50 border-2 border-neutral-200 group-hover:border-red-500 grid place-items-center transition-all duration-300 group-hover:scale-110">
                  {IconComp && <IconComp className="w-7 h-7 text-neutral-500 group-hover:text-red-600 transition-colors" />}
                </div>
                <span className="text-[11px] font-bold text-neutral-600 text-center leading-tight group-hover:text-red-600 transition uppercase">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-4">
          {site.homePromoBanners.map((banner) => {
            const style = banner.style === "yellow" ? "from-yellow-400 to-yellow-600 text-neutral-900" : banner.style === "dark" ? "from-neutral-800 to-neutral-900 text-white" : "from-red-700 to-red-900 text-white";
            const overlay = banner.style === "yellow" ? "from-yellow-600/80 via-yellow-500/40" : banner.style === "dark" ? "from-neutral-900/90 via-neutral-900/50" : "from-red-900/90 via-red-900/50";
            return (
              <Link key={banner.id} to={banner.link} className={`group relative overflow-hidden rounded bg-gradient-to-br ${style} min-h-[220px] flex flex-col justify-end p-6`}>
                <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-110 transition-transform duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-t ${overlay} to-transparent`} />
                <div className="relative"><div className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1.5">{banner.eyebrow}</div><h3 className="text-lg font-black leading-tight mb-0.5">{banner.title}</h3><h4 className="text-sm font-black text-red-500 mb-3">{banner.subtitle}</h4><span className="inline-block px-4 py-1.5 bg-white text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-sm group-hover:bg-yellow-400 group-hover:text-neutral-900 transition">{banner.buttonText}</span></div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TRENDING */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-wide">{site.homeTrendingTitle}</h2>
          <div className="w-16 h-1 bg-red-600 mx-auto mt-3 rounded-full" />
          <div className="flex justify-center gap-2 mt-5">
            {trendingTabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2 text-[11px] font-bold uppercase tracking-wider rounded-full transition ${activeTab === tab.id ? "bg-red-600 text-white shadow-md shadow-red-200" : "bg-white border border-neutral-300 text-neutral-600 hover:border-red-500 hover:text-red-600"}`}>{tab.label}</button>))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{displayProducts.map((p) => (<ProductCard key={p.id} product={p} />))}</div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustItems.map((f, i) => (
            <div key={i} className="flex items-center gap-3 group cursor-default">
              <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 group-hover:bg-red-50 group-hover:border-red-500 grid place-items-center shrink-0 transition-colors">
                <f.Icon className="w-5 h-5 text-neutral-500 group-hover:text-red-600 transition-colors" />
              </div>
              <div><div className="font-bold text-sm text-neutral-900">{f.title}</div><div className="text-[11px] text-neutral-500">{f.desc}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* DEAL COUNTDOWN */}
      <section className="bg-neutral-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 items-center gap-8">
          <div className="py-14 md:py-16">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-3">{site.dealEyebrow}</div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-1 leading-tight">{site.dealTitle}</h3>
            <h4 className="text-2xl md:text-3xl font-black text-red-500 mb-4">{site.dealSubtitle}</h4>
            <p className="text-neutral-400 text-sm mb-6 max-w-md leading-relaxed">{site.dealDescription}</p>
            <div className="flex flex-wrap gap-3 mb-7">
              {[{ label: "Days", value: timer.d }, { label: "Hours", value: timer.h }, { label: "Min", value: timer.m }, { label: "Sec", value: timer.s }].map((t) => (
                <div key={t.label} className="bg-red-600 text-white text-center w-16 py-2.5 rounded"><div className="text-2xl font-black leading-none">{String(t.value).padStart(2, "0")}</div><div className="text-[9px] uppercase mt-0.5 opacity-80">{t.label}</div></div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link to={site.dealLink} className="inline-flex items-center gap-2 px-7 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-sm transition">{site.dealButtonText}</Link>
              <div className="text-white"><span className="text-neutral-400 text-sm line-through mr-2">{site.dealOldPrice}</span><span className="text-2xl font-black text-yellow-400">{site.dealNewPrice}</span></div>
            </div>
          </div>
          <div className="hidden md:flex justify-center py-8"><div className="relative"><div className="absolute -inset-6 bg-red-600/10 rounded-full blur-3xl" /><img src={site.dealImage} alt={site.dealTitle} className="relative w-[450px] h-[360px] object-cover rounded-lg shadow-2xl" /></div></div>
        </div>
      </section>

      {/* FEATURED + SIDEBAR */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <div className="flex items-center gap-4 mb-6"><h2 className="text-lg font-black text-neutral-900 uppercase pb-2 border-b-[3px] border-red-600">{site.homeFeaturedTitle}</h2><div className="flex-1 h-px bg-neutral-200" /></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{hotProducts.map((p) => (<ProductCard key={p.id} product={p} />))}</div>
            <div className="flex items-center gap-4 mb-6 mt-12"><h2 className="text-lg font-black text-neutral-900 uppercase pb-2 border-b-[3px] border-red-600">{site.homeNewArrivalsTitle}</h2><div className="flex-1 h-px bg-neutral-200" /></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{newProducts.map((p) => (<ProductCard key={p.id} product={p} />))}</div>
          </div>
          <aside className="space-y-6">
            {/* Testimonial */}
            <div className="bg-yellow-400 rounded p-5">
              <h4 className="font-black text-xs text-neutral-900 uppercase mb-3 flex items-center gap-2"><StarIcon className="w-4 h-4 text-neutral-800" />{site.testimonialTitle}</h4>
              <p className="text-sm text-neutral-800 leading-relaxed mb-3 italic">"{site.testimonialQuote}"</p>
              <div className="flex items-center gap-2"><div className="w-9 h-9 rounded-full bg-neutral-900 grid place-items-center text-white text-xs font-bold">{site.testimonialName[0] || "T"}</div><div><div className="text-xs font-bold text-neutral-900">{site.testimonialName}</div><div className="text-[10px] text-neutral-700">{site.testimonialRole}</div></div></div>
            </div>
            {/* Promo */}
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8" /><div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative"><div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">{site.sidebarPromoEyebrow}</div><div className="text-3xl font-black mb-1">{site.sidebarPromoTitle}</div><div className="text-sm font-bold mb-3">{site.sidebarPromoSubtitle}</div><p className="text-xs opacity-80 mb-4">{site.sidebarPromoBody}</p><Link to={site.sidebarPromoLink} className="inline-block px-4 py-2 bg-white text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:bg-yellow-400 hover:text-neutral-900 transition">{site.sidebarPromoButton}</Link></div>
            </div>
            {/* Special Products */}
            <div>
              <div className="flex items-center gap-3 mb-4"><h4 className="font-black text-xs text-neutral-900 uppercase pb-2 border-b-[3px] border-red-600">Special Products</h4><div className="flex-1 h-px bg-neutral-200" /></div>
              <div className="space-y-2.5">
                {saleProducts.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/product/${p.slug}`} className="flex gap-3 bg-white border border-neutral-200 rounded p-2.5 hover:shadow-md hover:border-red-200 transition group">
                    <div className="w-16 h-16 rounded overflow-hidden shrink-0 bg-neutral-50"><img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                    <div className="flex-1 min-w-0"><div className="text-[11px] font-semibold text-neutral-800 line-clamp-2 leading-tight group-hover:text-red-600 transition">{p.name}</div><div className="mt-1"><Stars rating={p.rating} /></div><div className="flex items-center gap-1.5 mt-0.5">{p.oldPrice && <span className="text-[10px] text-neutral-400 line-through">${p.oldPrice.toFixed(2)}</span>}<span className="text-xs font-bold text-red-600">${p.price.toFixed(2)}</span></div></div>
                  </Link>
                ))}
              </div>
            </div>
            {/* Brands */}
            <div>
              <div className="flex items-center gap-3 mb-4"><h4 className="font-black text-xs text-neutral-900 uppercase pb-2 border-b-[3px] border-red-600">Popular Brands</h4><div className="flex-1 h-px bg-neutral-200" /></div>
              <div className="grid grid-cols-2 gap-2">{["Bosch", "DeWalt", "Stanley", "Makita", "Milwaukee", "Ridgid"].map((brand) => (<Link key={brand} to={`/shop?brand=${brand}`} className="bg-white border border-neutral-200 rounded px-3 py-2.5 text-center text-[10px] font-bold text-neutral-500 hover:border-red-500 hover:text-red-600 transition uppercase tracking-wider">{brand}</Link>))}</div>
            </div>
            {/* Gallery */}
            <div>
              <div className="flex items-center gap-3 mb-4"><h4 className="font-black text-xs text-neutral-900 uppercase pb-2 border-b-[3px] border-red-600">From The Gallery</h4><div className="flex-1 h-px bg-neutral-200" /></div>
              <div className="grid grid-cols-3 gap-1.5">{products.slice(0, 9).map((p) => (<Link key={p.id} to={`/product/${p.slug}`} className="aspect-square overflow-hidden rounded group"><img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /></Link>))}</div>
            </div>
          </aside>
        </div>
      </section>

      {/* BRANDS BAR */}
      <section className="bg-white border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-8"><div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3 items-center">{brands.map((b) => (<Link key={b} to={`/shop?brand=${b}`} className="text-center py-2 text-[10px] font-bold text-neutral-400 hover:text-red-600 transition uppercase tracking-wider">{b}</Link>))}</div></div>
      </section>
    </div>
  );
}
