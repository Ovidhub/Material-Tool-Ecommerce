import { api } from "./client";
import type { Category } from "./types";

export async function listCategories(): Promise<Category[]> {
  return (await api<{ data: Category[] }>("/categories")).data;
}
export async function createCategory(name: string): Promise<Category> {
  return (await api<{ data: Category }>("/categories", { method: "POST", body: JSON.stringify({ name }) })).data;
}
export async function updateCategory(id: string, name: string): Promise<Category> {
  return (await api<{ data: Category }>(`/categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) })).data;
}
export async function deleteCategory(id: string): Promise<void> {
  await api(`/categories/${id}`, { method: "DELETE" });
}
