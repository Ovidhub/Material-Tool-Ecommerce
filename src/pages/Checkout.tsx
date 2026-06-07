import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import type { PaymentMethod } from "../context/StoreContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCardForm from "../components/StripeCardForm";
import { createPaymentIntent } from "../api/payments";
import { cartToItems } from "../api/orders";

export default function Checkout() {
  const { state, placeOrder, cartSubtotal } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const enabledMethods = state.paymentMethods.filter((m) => m.enabled);
  const [selectedMethodId, setSelectedMethodId] = useState(enabledMethods[0]?.id || "");
  const [form, setForm] = useState({ email: state.user?.email || "", firstName: "", lastName: "", address: "", city: "", state: "", zip: "", phone: "", cardName: "", cardNumber: "", expiry: "", cvv: "" });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const selected = enabledMethods.find((m) => m.id === selectedMethodId);
  const stripePromise = useMemo(
    () => (selected?.type === "stripe" && selected.publicKey ? loadStripe(selected.publicKey) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected?.id, selected?.publicKey],
  );

  const shipping = cartSubtotal >= 199 ? 0 : 14.99;
  const tax = cartSubtotal * 0.08;
  const total = cartSubtotal + shipping + tax;

  useEffect(() => {
    if ((!selectedMethodId || !enabledMethods.some((m) => m.id === selectedMethodId)) && enabledMethods[0]) {
      setSelectedMethodId(enabledMethods[0].id);
    }
  }, [enabledMethods, selectedMethodId]);

  useEffect(() => {
    if (step === 3 && selected?.type === "stripe" && !clientSecret && state.cart.length > 0) {
      createPaymentIntent(cartToItems(state.cart))
        .then((r) => { setClientSecret(r.clientSecret); setIntentId(r.intentId); })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selected?.id]);

  if (state.cart.length === 0) { nav("/cart"); return null; }

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function completeOrder() {
    try {
      await placeOrder({
        items: cartToItems(state.cart),
        paymentMethod: selected?.name ?? "Manual Payment",
        stripePaymentIntentId: intentId ?? undefined,
        email: form.email, phone: form.phone,
        firstName: form.firstName, lastName: form.lastName,
        address: form.address, city: form.city, state: form.state, zip: form.zip,
      });
      nav("/order-success");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not place order. Please try again.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) { setStep((step + 1) as 1 | 2 | 3); return; }
    if (selected?.type === "stripe") return; // Stripe handled by StripeCardForm's Pay button
    await completeOrder();
  }

  const inputCls = "w-full px-3 py-2.5 border border-neutral-300 rounded-sm text-sm focus:outline-none focus:border-red-500 bg-white";

  function methodLabel(method: PaymentMethod) {
    if (method.type === "stripe") return "Stripe card payment";
    if (method.type === "paypal") return "PayPal checkout";
    if (method.type === "crypto") return method.network ? `Crypto on ${method.network}` : "Crypto payment";
    if (method.type === "bank") return "Manual bank transfer";
    return "Custom payment method";
  }

  function MethodIcon({ type }: { type: PaymentMethod["type"] }) {
    if (type === "stripe") return <span className="font-black text-[10px]">CARD</span>;
    if (type === "paypal") return <span className="font-black text-[10px]">PP</span>;
    if (type === "crypto") return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path d="M9 8h4.5a2.5 2.5 0 010 5H9z"/><path d="M9 13h5a2.5 2.5 0 010 5H9z"/><path d="M9 6v12"/></svg>;
    if (type === "bank") return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M3 10l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>;
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path d="M12 2v20M2 12h20"/></svg>;
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-neutral-900 uppercase mb-2">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {[{ n: 1, label: "Contact" }, { n: 2, label: "Shipping" }, { n: 3, label: "Payment" }].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${step >= s.n ? "bg-red-600 text-white" : "bg-neutral-200 text-neutral-500"}`}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span className={`ml-2 text-xs font-bold ${step >= s.n ? "text-neutral-900" : "text-neutral-400"}`}>{s.label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 mx-3 ${step > s.n ? "bg-red-600" : "bg-neutral-200"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white border border-neutral-200 rounded-sm p-5">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-bold text-neutral-900 mb-3">Contact Information</h2>
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Email</label>
                  <input type="email" required className={inputCls} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Phone</label>
                  <input type="tel" required className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 123-4567" />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-bold text-neutral-900 mb-3">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">First Name</label><input required className={inputCls} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} /></div>
                  <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Last Name</label><input required className={inputCls} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} /></div>
                </div>
                <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">Address</label><input required className={inputCls} value={form.address} onChange={(e) => update("address", e.target.value)} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">City</label><input required className={inputCls} value={form.city} onChange={(e) => update("city", e.target.value)} /></div>
                  <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">State</label><input required className={inputCls} value={form.state} onChange={(e) => update("state", e.target.value)} /></div>
                  <div><label className="text-[11px] font-bold text-neutral-600 uppercase mb-1 block">ZIP</label><input required className={inputCls} value={form.zip} onChange={(e) => update("zip", e.target.value)} /></div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-bold text-neutral-900 mb-3">Payment</h2>
                {enabledMethods.length === 0 ? (
                  <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-4 rounded-sm text-sm">
                    No payment methods are currently enabled. Please contact store support.
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {enabledMethods.map((method) => (
                        <label key={method.id} className={`border rounded-sm p-3 cursor-pointer transition ${selectedMethodId === method.id ? "border-red-600 bg-red-50" : "border-neutral-200 hover:border-red-300"}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="paymentMethod" checked={selectedMethodId === method.id} onChange={() => setSelectedMethodId(method.id)} className="accent-red-600" />
                            <div className="w-9 h-9 rounded bg-white border border-neutral-200 grid place-items-center text-red-600"><MethodIcon type={method.type} /></div>
                            <div>
                              <div className="text-sm font-bold text-neutral-900">{method.name}</div>
                              <div className="text-[11px] text-neutral-500">{methodLabel(method)}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {(() => {
                      const method = enabledMethods.find((m) => m.id === selectedMethodId);
                      if (!method) return null;
                      if (method.type === "stripe") {
                        return (
                          <div className="space-y-3 pt-2">
                            {clientSecret && stripePromise ? (
                              <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <StripeCardForm onConfirmed={completeOrder} />
                              </Elements>
                            ) : (
                              <div className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-sm p-3">
                                {selected?.publicKey ? "Preparing secure payment…" : "Stripe is not fully configured (missing publishable key)."}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return (
                        <div className="bg-neutral-50 border border-neutral-200 rounded-sm p-4 text-sm text-neutral-700">
                          <div className="font-bold text-neutral-900 mb-1">{method.name} instructions</div>
                          <p className="whitespace-pre-line">{method.instructions || "You will receive payment instructions after placing your order."}</p>
                          {method.walletAddress && <div className="mt-3 text-xs"><span className="font-bold">Wallet:</span> {method.walletAddress}</div>}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
            <div className="flex justify-between mt-6 pt-4 border-t border-neutral-200">
              {step > 1 ? (
                <button type="button" onClick={() => setStep((step - 1) as 1 | 2 | 3)} className="px-4 py-2.5 border border-neutral-300 text-sm font-bold rounded-sm">← Back</button>
              ) : (
                <Link to="/cart" className="px-4 py-2.5 border border-neutral-300 text-sm font-bold rounded-sm">← Cart</Link>
              )}
              {!(step === 3 && selected?.type === "stripe") && (
                <button type="submit" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold uppercase rounded-sm transition">
                  {step === 3 ? `Place Order $${total.toFixed(2)}` : "Continue →"}
                </button>
              )}
            </div>
          </div>

          <aside className="bg-white border border-neutral-200 rounded-sm p-5 h-fit lg:sticky lg:top-40">
            <h3 className="font-bold text-sm text-neutral-900 mb-3">Your Order</h3>
            <div className="space-y-2 mb-4 max-h-52 overflow-auto">
              {state.cart.map((i) => (
                <div key={i.productId} className="flex gap-2 items-center">
                  <img src={i.emoji} alt="" className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold line-clamp-1">{i.name}</div>
                    <div className="text-[11px] text-neutral-500">Qty: {i.qty}</div>
                  </div>
                  <div className="text-xs font-bold">${(i.price * i.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between pt-2 mt-2 border-t border-neutral-200 text-sm">
                <span className="font-bold">Total</span>
                <span className="font-black text-lg text-red-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
