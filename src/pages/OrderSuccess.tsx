import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { CheckCircleIcon, TruckIcon } from "../components/Icons";

export default function OrderSuccess() {
  const { state } = useStore();
  const lastOrder = state.orders[0];
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-600 grid place-items-center mb-6"><CheckCircleIcon className="w-10 h-10 text-white" /></div>
      <h1 className="text-3xl font-black text-neutral-900 mb-2">Order Confirmed!</h1>
      <p className="text-neutral-600 text-sm mb-6">We've sent a confirmation email with tracking details.</p>
      {lastOrder && (
        <div className="bg-white border border-neutral-200 rounded-sm p-5 mb-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
            <div><div className="text-[11px] text-neutral-500">Order Number</div><div className="font-black text-lg">{lastOrder.id}</div></div>
            <div className="text-right"><div className="text-[11px] text-neutral-500">Total</div><div className="font-black text-lg text-red-600">${lastOrder.total.toFixed(2)}</div></div>
          </div>
          <div className="space-y-2 mb-4">{lastOrder.items.map((i) => (<div key={i.productId} className="flex items-center gap-3 text-sm"><img src={i.emoji} alt="" className="w-10 h-10 object-cover rounded" /><span className="flex-1 text-xs">{i.name}</span><span className="text-neutral-500 text-xs">×{i.qty}</span><span className="font-semibold text-xs">${(i.price * i.qty).toFixed(2)}</span></div>))}</div>
          <div className="bg-green-50 border border-green-200 rounded-sm p-3 text-xs text-green-700 flex items-center gap-2">
            <TruckIcon className="w-4 h-4 text-green-600 shrink-0" />
            Estimated delivery: {new Date(Date.now() + 5 * 86400000).toLocaleDateString()} – {new Date(Date.now() + 7 * 86400000).toLocaleDateString()}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/account" className="px-5 py-2.5 bg-white border border-neutral-200 text-sm font-bold rounded-sm hover:bg-neutral-50">View Orders</Link>
        <Link to="/shop" className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-sm hover:bg-red-700">Continue Shopping</Link>
      </div>
    </div>
  );
}
