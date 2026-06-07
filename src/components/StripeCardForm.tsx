import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export default function StripeCardForm({ onConfirmed }: { onConfirmed: () => void | Promise<void> }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pay() {
    if (!stripe || !elements) return;
    setBusy(true); setError(null);
    const { error: submitErr } = await elements.submit();
    if (submitErr) { setError(submitErr.message ?? "Card error"); setBusy(false); return; }
    const { error: confirmErr } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    setBusy(false);
    if (confirmErr) { setError(confirmErr.message ?? "Payment failed"); return; }
    await onConfirmed();
  }

  return (
    <div className="space-y-3">
      <PaymentElement />
      {error && <div className="text-xs text-red-600">{error}</div>}
      <button type="button" disabled={busy} onClick={pay}
        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold uppercase rounded-sm">
        {busy ? "Processing…" : "Pay now"}
      </button>
    </div>
  );
}
