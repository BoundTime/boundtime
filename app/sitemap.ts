import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/boundtime-features`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${base}/community-regeln`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
    { url: `${base}/agb`, lastModified: now, changeFrequency: "yearly", priority: 0.35 },
  ];
}
