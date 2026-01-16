import type { MetadataRoute } from "next";
import { getPaintings } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beijun.art";

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artist`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // 动态画作页面（如果将来有详情页）
  const paintings = await getPaintings({ published: true });
  const paintingPages: MetadataRoute.Sitemap = paintings.map((painting) => ({
    url: `${baseUrl}/gallery?highlight=${painting.id}`,
    lastModified: new Date(painting.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...paintingPages];
}
