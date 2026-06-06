import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { useStore } from "../context/StoreContext";

type Props = { product: Product; view?: "grid" | "list" };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= rating ? "text-yellow-400" : "text-neutral-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductCard({ product, view = "grid" }: Props) {
  const { addToCart, toggleWishlist, state } = useStore();
  const wished = state.wishlist.includes(product.id);

  if (view === "list") {
    return (
      <div className="group bg-white border border-neutral-200 hover:border-red-200 rounded-sm p-4 hover:shadow-lg transition-all grid grid-cols-[130px_1fr_auto] gap-5">
        <Link to={`/product/${product.slug}`} className="bg-neutral-50 rounded overflow-hidden aspect-square">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
        </Link>
        <div>
          <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-0.5">{product.brand}</div>
          <Link to={`/product/${product.slug}`} className="font-semibold text-sm text-neutral-900 hover:text-red-600 transition line-clamp-2">{product.name}</Link>
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{product.shortDesc}</p>
          <div className="mt-2"><Stars rating={product.rating} /></div>
        </div>
        <div className="text-right flex flex-col justify-between items-end">
          <div>
            {product.oldPrice && <div className="text-xs text-neutral-400 line-through">${product.oldPrice.toFixed(2)}</div>}
            <div className="text-lg font-bold text-red-600">${product.price.toFixed(2)}</div>
          </div>
          <button
            onClick={() => addToCart({ productId: product.id, name: product.name, price: product.price, emoji: product.image })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white border border-neutral-200 hover:border-red-300 rounded-sm overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 tracking-wider text-white ${
            product.badge === "Sale" ? "bg-red-600" :
            product.badge === "Hot" ? "bg-orange-500" :
            product.badge === "New" ? "bg-green-600" :
            "bg-blue-600"
          }`}>
            {product.badge === "Sale" && product.oldPrice
              ? `-${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%`
              : product.badge
            }
          </span>
        </div>
      )}

      {/* Hover action buttons */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
        <button
          onClick={() => toggleWishlist(product.id)}
          className="w-8 h-8 rounded bg-white shadow-md grid place-items-center hover:bg-red-50 transition"
          title="Add to wishlist"
        >
          <svg className={`w-3.5 h-3.5 ${wished ? "text-red-600 fill-red-600" : "text-neutral-400"}`} fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <Link
          to={`/product/${product.slug}`}
          className="w-8 h-8 rounded bg-white shadow-md grid place-items-center hover:bg-red-50 transition"
          title="Quick view"
        >
          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </Link>
      </div>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-neutral-50 p-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 border-t border-neutral-100">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-[12px] font-semibold text-neutral-800 hover:text-red-600 transition line-clamp-2 min-h-[2.2rem] leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mt-1.5">
          <Stars rating={product.rating} />
          <span className="text-[10px] text-neutral-400">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {product.oldPrice && (
            <span className="text-[11px] text-neutral-400 line-through">${product.oldPrice.toFixed(2)}</span>
          )}
          <span className="text-[15px] font-bold text-red-600">${product.price.toFixed(2)}</span>
        </div>

        <button
          onClick={() => addToCart({ productId: product.id, name: product.name, price: product.price, emoji: product.image })}
          className="mt-2.5 w-full py-2 bg-neutral-900 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider transition rounded-sm flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          ADD TO CART
        </button>
      </div>
    </div>
  );
}

export { Stars };
