import { api } from "./client";
import type { PaymentMethod } from "./types";

export async function listPaymentMethods(): Promise<PaymentMethod[]> {
  return (await api<{ data: PaymentMethod[] }>("/payment-methods")).data;
}
export async function listAdminPaymentMethods(): Promise<PaymentMethod[]> {
  return (await api<{ data: PaymentMethod[] }>("/admin/payment-methods")).data;
}
export async function createPaymentMethod(m: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
  return (await api<{ data: PaymentMethod }>("/payment-methods", { method: "POST", body: JSON.stringify(m) })).data;
}
export async function updatePaymentMethod(m: PaymentMethod): Promise<PaymentMethod> {
  return (await api<{ data: PaymentMethod }>(`/payment-methods/${m.id}`, { method: "PUT", body: JSON.stringify(m) })).data;
}
export async function deletePaymentMethod(id: string): Promise<void> {
  await api(`/payment-methods/${id}`, { method: "DELETE" });
}
