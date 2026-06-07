import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard, { Stars } from "../components/ProductCard";

export default function ProductDetail() {
  const { slug } = useParams();
  const { state, addToCart, toggleWishlist } = useStore();
  const products = state.products;
  const product = products.find((p) => p.slug === slug);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");

  if (!product) {
    if (state.loading) {
      return <div className="max-w-7xl mx-auto px-4 py-24 text-center text-neutral-500">Loading…</div>;
    }
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/shop" className="inline-block mt-4 px-6 py-3 bg-red-600 text-white font-bold rounded-sm">Back to shop</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 5);
  const wished = state.wishlist.includes(product.id);
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  return (
    <div className="bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-neutral-500 mb-6 flex flex-wrap gap-1">
          <Link to="/" className="hover:text-red-600">Home</Link> /
          <Link to="/shop" className="hover:text-red-600">Shop</Link> /
          <Link to={`/shop?category=${product.category}`} className="hover:text-red-600 capitalize">{product.category.replace("-", " ")}</Link> /
          <span className="text-neutral-900 font-medium">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <div className="bg-white border border-neutral-200 rounded p-4">
            <div className="aspect-square overflow-hidden rounded">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-neutral-50 rounded overflow-hidden border border-neutral-200 hover:border-red-500 cursor-pointer transition">
                  <img src={product.image} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">{product.brand}</div>
            <h1 className="text-2xl md:text-3xl font-black text-neutral-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <Stars rating={product.rating} />
              <span className="text-sm text-neutral-500">({product.reviews} reviews)</span>
              <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">✓ In Stock ({product.stock})</span>
            </div>

            <div className="flex items-end gap-3 mb-5 pb-5 border-b border-neutral-200">
              {product.oldPrice && <span className="text-lg text-neutral-400 line-through">${product.oldPrice.toFixed(2)}</span>}
              <span className="text-3xl font-black text-red-600">${product.price.toFixed(2)}</span>
              {discount > 0 && <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-sm">-{discount}% OFF</span>}
            </div>

            <p className="text-neutral-600 text-sm leading-relaxed mb-5">{product.description}</p>

            {/* SKU & Category */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-neutral-200 text-sm mb-5">
              <div><span className="text-neutral-500">SKU:</span> <span className="font-bold text-neutral-900">{product.sku}</span></div>
              <div><span className="text-neutral-500">Category:</span> <span className="font-bold text-neutral-900 capitalize">{product.subcategory}</span></div>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-6">
              {product.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm text-neutral-600">
                  <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  {f}
                </li>
              ))}
            </ul>

            {/* Quantity + actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center border border-neutral-300 rounded-sm overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-neutral-100 text-lg font-bold">−</button>
                <span className="px-5 py-3 font-bold min-w-[50px] text-center border-x border-neutral-300">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-4 py-3 hover:bg-neutral-100 text-lg font-bold">+</button>
              </div>
              <button
                onClick={() => addToCart({ productId: product.id, name: product.name, price: product.price, emoji: product.image }, qty)}
                className="flex-1 min-w-[200px] px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider rounded-sm transition"
              >
                ADD TO CART · ${(product.price * qty).toFixed(2)}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`px-5 py-3 border-2 rounded-sm transition ${wished ? "border-red-600 text-red-600 bg-red-50" : "border-neutral-300 hover:border-red-600 hover:text-red-600"}`}
              >
                <svg className="w-5 h-5" fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>

            {/* Delivery info */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🚚", title: "Free Shipping", desc: "Orders $199+" },
                { icon: "↩️", title: "Easy Returns", desc: "30-Day Policy" },
                { icon: "🛡️", title: "Warranty", desc: "Included" },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-neutral-200 rounded p-3 text-center">
                  <div className="text-lg mb-1">{item.icon}</div>
                  <div className="text-[11px] font-bold text-neutral-900">{item.title}</div>
                  <div className="text-[10px] text-neutral-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-neutral-200 rounded mb-16">
          <div className="flex border-b border-neutral-200">
            {(["desc", "specs", "reviews"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 font-bold text-sm uppercase tracking-wider border-b-2 -mb-px transition ${
                  tab === t ? "border-red-600 text-red-600" : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {t === "desc" ? "Description" : t === "specs" ? "Specifications" : `Reviews (${product.reviews})`}
              </button>
            ))}
          </div>
          <div className="p-6">
            {tab === "desc" && (
              <div>
                <p className="text-neutral-700 leading-relaxed mb-4">{product.description}</p>
                <h4 className="font-bold text-neutral-900 mb-2">What's Included</h4>
                <ul className="list-disc pl-6 text-neutral-600 space-y-1 text-sm">
                  <li>1x {product.name}</li>
                  <li>Instruction manual & quick-start guide</li>
                  <li>Carrying case / storage bag</li>
                  <li>Warranty registration card</li>
                </ul>
              </div>
            )}
            {tab === "specs" && (
              <div className="grid md:grid-cols-2 gap-2">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3 px-4 bg-neutral-50 rounded text-sm">
                    <span className="text-neutral-600">{k}</span>
                    <span className="font-bold text-neutral-900">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === "reviews" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center pb-6 border-b border-neutral-200">
                  <div className="text-center">
                    <div className="text-5xl font-black text-neutral-900">{product.rating}</div>
                    <div className="my-1"><Stars rating={product.rating} /></div>
                    <div className="text-sm text-neutral-500">{product.reviews} reviews</div>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const pct = s === 5 ? 72 : s === 4 ? 18 : s === 3 ? 6 : s === 2 ? 3 : 1;
                      return (
                        <div key={s} className="flex items-center gap-3">
                          <span className="text-sm w-4">{s}★</span>
                          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-neutral-500 w-10 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {[
                  { name: "James M.", date: "2 weeks ago", rating: 5, text: "Excellent build quality. I've been using this on site daily and it's held up beautifully." },
                  { name: "Lisa R.", date: "1 month ago", rating: 5, text: "Exactly what I was looking for. Fast shipping and great customer service." },
                  { name: "Robert K.", date: "2 months ago", rating: 4, text: "Great tool, performs well. Only reason I didn't give 5 stars is the case could be better." },
                ].map((r, i) => (
                  <div key={i} className="pb-5 border-b border-neutral-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-red-600 grid place-items-center text-white font-bold text-sm">{r.name[0]}</div>
                      <div>
                        <div className="font-semibold text-neutral-900 text-sm">{r.name}</div>
                        <div className="text-[11px] text-neutral-500">{r.date}</div>
                      </div>
                      <div className="ml-auto"><Stars rating={r.rating} /></div>
                    </div>
                    <p className="text-sm text-neutral-600">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-neutral-900 uppercase mb-5 pb-3 border-b-2 border-red-600 inline-block">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
