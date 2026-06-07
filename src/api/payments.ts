import { api } from "./client";

export async function createPaymentIntent(items: { productId: number; qty: number }[]) {
  return api<{ clientSecret: string; intentId: string; amount: number }>(
    "/payments/intent", { method: "POST", body: JSON.stringify({ items }) },
  );
}
