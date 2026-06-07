import { api } from "./client";
import type { SiteContent } from "./types";

export async function getSiteContent(): Promise<SiteContent> {
  return (await api<{ data: SiteContent }>("/site-content")).data;
}
export async function updateSiteContent(content: SiteContent): Promise<SiteContent> {
  return (await api<{ data: SiteContent }>("/site-content", { method: "PUT", body: JSON.stringify(content) })).data;
}
