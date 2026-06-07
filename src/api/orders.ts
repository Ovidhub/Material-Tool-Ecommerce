import { api } from "./client";
import type { CartItem, Order } from "./types";

type CheckoutPayload = {
  items: { productId: number; qty: number }[];
  paymentMethod: string;
  stripePaymentIntentId?: string;
  email?: string; phone?: string; firstName?: string; lastName?: string;
  address?: string; city?: string; state?: string; zip?: string;
};

export async function listOrders(): Promise<Order[]> {
  return (await api<{ data: Order[] }>("/orders")).data;
}
export async function listAllOrders(): Promise<Order[]> {
  return (await api<{ data: Order[] }>("/orders/all")).data;
}
export async function placeOrder(payload: CheckoutPayload): Promise<Order> {
  return (await api<{ data: Order }>("/orders", { method: "POST", body: JSON.stringify(payload) })).data;
}
export async function updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
  return (await api<{ data: Order }>(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) })).data;
}
export function cartToItems(cart: CartItem[]) {
  return cart.map((i) => ({ productId: i.productId, qty: i.qty }));
}
