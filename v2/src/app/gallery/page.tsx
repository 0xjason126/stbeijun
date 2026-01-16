import type { Metadata } from "next";
import { getPaintings, getYears } from "@/lib/data";
import { GalleryClient } from "./GalleryClient";
import { BreadcrumbSchema } from "@/components/public/StructuredData";

export const revalidate = 60; // ISR: 60 秒重验证

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stbeijun.art";

export const metadata: Metadata = {
  title: "作品画廊",
  description: "浏览贝军先生的国画作品集，包含人物画、山水画、花鸟画等多种题材。支持按年份、状态筛选和搜索。",
  openGraph: {
    title: "作品画廊 | 贝军国画",
    description: "浏览贝军先生的国画作品集，探索传统与现代融合的水墨艺术。",
    images: ["/og-image.jpg"],
  },
};

// CollectionPage 结构化数据
function CollectionPageSchema({ paintingCount }: { paintingCount: number }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "贝军国画作品集",
    description: "浏览贝军先生的国画作品集，包含人物画、山水画、花鸟画等多种题材。",
    url: `${siteUrl}/gallery`,
    isPartOf: {
      "@type": "WebSite",
      name: "贝军国画",
      url: siteUrl,
    },
    about: {
      "@type": "Thing",
      name: "中国传统国画",
    },
    numberOfItems: paintingCount,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function GalleryPage() {
  const [paintings, years] = await Promise.all([
    getPaintings({ published: true }),
    getYears(),
  ]);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "首页", url: siteUrl },
          { name: "作品画廊", url: `${siteUrl}/gallery` },
        ]}
      />
      <CollectionPageSchema paintingCount={paintings.length} />
      <GalleryClient initialPaintings={paintings} years={years} />
    </>
  );
}
