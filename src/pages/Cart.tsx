import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Cart() {
  const { state, updateQty, removeFromCart, clearCart, cartSubtotal } = useStore();
  const shipping = cartSubtotal >= 199 || cartSubtotal === 0 ? 0 : 14.99;
  const tax = cartSubtotal * 0.08;
  const total = cartSubtotal + shipping + tax;

  if (state.cart.length === 0) {
    return (
      <div className="bg-neutral-50 min-h-[60vh] grid place-items-center">
        <div className="text-center px-4 py-16">
          <div className="w-20 h-20 mx-auto bg-neutral-200 rounded-full grid place-items-center mb-5">
            <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mb-2 uppercase">Your Cart is Empty</h1>
          <p className="text-neutral-500 text-sm mb-6">Looks like you haven't added any tools yet.</p>
          <Link to="/shop" className="inline-block px-7 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Banner */}
      <div className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-black uppercase">Shopping Cart</h1>
          <div className="text-xs text-neutral-400 mt-1">
            <Link to="/" className="hover:text-red-500">Home</Link>
            <span className="mx-1.5">/</span>
            <span>Cart ({state.cart.length} items)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Table */}
          <div>
            <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 text-[10px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold">Product</th>
                    <th className="text-center px-4 py-3 font-bold hidden sm:table-cell">Price</th>
                    <th className="text-center px-4 py-3 font-bold">Quantity</th>
                    <th className="text-right px-4 py-3 font-bold">Total</th>
                    <th className="px-2 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {state.cart.map((item) => (
                    <tr key={item.productId} className="hover:bg-neutral-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-neutral-50 rounded overflow-hidden shrink-0 border border-neutral-200">
                            <img src={item.emoji} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-neutral-900 line-clamp-2">{item.name}</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5 sm:hidden">${item.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center hidden sm:table-cell">
                        <span className="text-sm font-bold text-neutral-700">${item.price.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <div className="inline-flex border border-neutral-300 rounded-sm overflow-hidden">
                            <button onClick={() => updateQty(item.productId, item.qty - 1)} className="px-2.5 py-1.5 hover:bg-neutral-100 text-sm font-bold">−</button>
                            <span className="px-3 py-1.5 text-xs font-bold border-x border-neutral-300 min-w-[32px] text-center bg-neutral-50">{item.qty}</span>
                            <button onClick={() => updateQty(item.productId, item.qty + 1)} className="px-2.5 py-1.5 hover:bg-neutral-100 text-sm font-bold">+</button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-bold text-red-600">${(item.price * item.qty).toFixed(2)}</span>
                      </td>
                      <td className="px-2 py-4">
                        <button onClick={() => removeFromCart(item.productId)} className="p-1 hover:bg-red-50 rounded transition" title="Remove">
                          <svg className="w-4 h-4 text-neutral-400 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <Link to="/shop" className="text-[11px] text-red-600 font-bold hover:underline uppercase tracking-wider">
                ← Continue Shopping
              </Link>
              <button
                onClick={() => { if (confirm("Clear all items?")) clearCart(); }}
                className="text-[11px] text-neutral-500 font-bold hover:text-red-600 uppercase tracking-wider transition"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="bg-white border border-neutral-200 rounded-sm h-fit lg:sticky lg:top-40">
            <div className="bg-neutral-900 text-white px-5 py-3">
              <h3 className="text-[11px] font-black uppercase tracking-wider">Order Summary</h3>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-600">Subtotal</span><span className="font-bold">${cartSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Shipping</span><span className="font-bold">{shipping === 0 ? <span className="text-green-600">FREE</span> : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Est. Tax</span><span className="font-bold">${tax.toFixed(2)}</span></div>

              {cartSubtotal > 0 && cartSubtotal < 199 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-sm p-2.5 text-[11px] text-yellow-800">
                  ✨ Add <b>${(199 - cartSubtotal).toFixed(2)}</b> more for <b>FREE SHIPPING!</b>
                  <div className="w-full bg-yellow-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(cartSubtotal / 199) * 100}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 mt-3 border-t border-neutral-200">
                <span className="font-black text-neutral-900 uppercase text-xs tracking-wider">Total</span>
                <span className="text-2xl font-black text-red-600">${total.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="block w-full text-center py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm transition mt-2"
              >
                PROCEED TO CHECKOUT →
              </Link>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-400 pt-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                <span>Secure checkout · 256-bit SSL encryption</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
