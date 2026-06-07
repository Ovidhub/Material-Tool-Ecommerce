import { api } from "./client";

export async function listWishlist(): Promise<number[]> {
  return (await api<{ data: number[] }>("/wishlist")).data;
}
export async function addWishlist(productId: number): Promise<void> {
  await api("/wishlist", { method: "POST", body: JSON.stringify({ product_id: productId }) });
}
export async function removeWishlist(productId: number): Promise<void> {
  await api(`/wishlist/${productId}`, { method: "DELETE" });
}
