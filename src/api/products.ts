import { api } from "./client";
import type { Product } from "./types";

type Paginated<T> = { data: T[]; meta: { current_page: number; last_page: number; total: number } };

export async function listProducts(params: Record<string, string | number> = {}): Promise<Paginated<Product>> {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, String(v)]),
  ).toString();
  return api<Paginated<Product>>(`/products${qs ? `?${qs}` : ""}`);
}
export async function getProduct(slug: string): Promise<Product> {
  return (await api<{ data: Product }>(`/products/${slug}`)).data;
}
export async function createProduct(p: Partial<Product>): Promise<Product> {
  return (await api<{ data: Product }>("/products", { method: "POST", body: JSON.stringify(p) })).data;
}
export async function updateProduct(id: number, p: Partial<Product>): Promise<Product> {
  return (await api<{ data: Product }>(`/products/${id}`, { method: "PUT", body: JSON.stringify(p) })).data;
}
export async function deleteProduct(id: number): Promise<void> {
  await api(`/products/${id}`, { method: "DELETE" });
}
