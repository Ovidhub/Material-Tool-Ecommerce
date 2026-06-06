import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import { HeartIcon } from "../components/Icons";

export default function Wishlist() {
  const { state } = useStore();
  const wishedProducts = state.products.filter((p) => state.wishlist.includes(p.id));
  if (wishedProducts.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <HeartIcon className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
      <h1 className="text-2xl font-black mb-3">Your Wishlist Is Empty</h1>
      <p className="text-sm text-neutral-500 mb-6">Save tools you love to buy later.</p>
      <Link to="/shop" className="inline-block px-6 py-3 bg-red-600 text-white text-sm font-bold rounded-sm">Browse Products</Link>
    </div>
  );
  return (
    <div className="bg-neutral-50 min-h-screen"><div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-neutral-900 uppercase mb-6">My Wishlist ({wishedProducts.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">{wishedProducts.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </div></div>
  );
}
