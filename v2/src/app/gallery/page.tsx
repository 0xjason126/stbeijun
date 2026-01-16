import type { Metadata } from "next";
import { getPaintings, getYears } from "@/lib/data";
import { GalleryClient } from "./GalleryClient";

export const revalidate = 60; // ISR: 60 秒重验证

export const metadata: Metadata = {
  title: "作品画廊",
  description: "浏览贝军先生的国画作品集，包含人物画、山水画、花鸟画等多种题材。支持按年份、状态筛选和搜索。",
  openGraph: {
    title: "作品画廊 | 贝军国画",
    description: "浏览贝军先生的国画作品集，探索传统与现代融合的水墨艺术。",
    images: ["/og-image.jpg"],
  },
};

export default async function GalleryPage() {
  const [paintings, years] = await Promise.all([
    getPaintings({ published: true }),
    getYears(),
  ]);

  return <GalleryClient initialPaintings={paintings} years={years} />;
}
