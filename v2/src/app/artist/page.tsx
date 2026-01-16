import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Navbar, ScrollProgress, Footer, PersonSchema, FAQSchema } from "@/components/public";
import { Timeline } from "@/components/public/Timeline";
import { getArtist } from "@/lib/data";

export const revalidate = 60; // ISR: 60 秒重验证

export const metadata: Metadata = {
  title: "画家介绍",
  description: "了解贝军先生的艺术历程与创作理念。当代国画艺术家，专注于人物画、山水画创作，将传统水墨技法与现代审美融合。",
  openGraph: {
    title: "贝军 | 当代国画艺术家",
    description: "了解贝军先生的艺术历程与创作理念，专注于人物画、山水画创作。",
    images: ["/og-image.jpg"],
  },
};

export default async function ArtistPage() {
  const artist = await getArtist();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beijun.art";

  // FAQ 数据（用于 GEO 优化）
  const faqs = [
    {
      question: "贝军是谁？",
      answer: `贝军是当代国画艺术家，专注于人物画、山水画创作。${artist.title ? `现为${artist.title}。` : ""}将传统水墨技法与现代审美相融合，形成独特的艺术风格。`,
    },
    {
      question: "贝军的代表作有哪些？",
      answer: "贝军的作品涵盖人物画、山水画、花鸟画等多种题材。可在本站画廊页面浏览全部作品，支持按年份和类型筛选。",
    },
    {
      question: "如何购买贝军的画作？",
      answer: "如需购买画作或咨询定制，请通过微信联系：stbeijun0425。我们会为您提供详细的作品信息和购买流程。",
    },
    {
      question: "贝军接受定制画作吗？",
      answer: "是的，贝军接受画作定制。您可以通过微信联系咨询定制事宜，包括题材、尺寸、价格等详细信息。",
    },
  ];

  return (
    <>
      {/* 结构化数据 */}
      <PersonSchema artist={artist} siteUrl={siteUrl} />
      <FAQSchema faqs={faqs} />

      <ScrollProgress />
      <Navbar />

      <main className="pt-24 lg:pt-28 min-h-screen">
        {/* 画家头像与简介 - 杂志式布局 */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              {/* 竖版照片 */}
              <div className="relative mx-auto lg:mx-0 max-w-sm lg:max-w-md">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={artist.avatarUrl}
                    alt={artist.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 320px, (max-width: 1024px) 400px, 450px"
                  />
                </div>
                {/* 装饰性边框 */}
                <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-primary/30 rounded-lg -z-10" />
              </div>

              {/* 简介内容 */}
              <div className="text-center lg:text-left lg:py-8">
                <p className="text-sm text-primary font-medium tracking-widest uppercase mb-4">
                  当代国画艺术家
                </p>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                  {artist.name}
                </h1>
                {artist.title && (
                  <p className="mt-4 text-xl text-muted-foreground font-light">
                    {artist.title}
                  </p>
                )}

                {/* 分隔线 */}
                <div className="my-8 w-16 h-0.5 bg-primary mx-auto lg:mx-0" />

                <div
                  className="prose prose-lg prose-stone dark:prose-invert max-w-none text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: artist.bio }}
                />

                {/* 联系方式 */}
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">联系咨询</p>
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <span className="px-4 py-2 bg-muted rounded-md font-mono text-sm">
                      微信：stbeijun0425
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 艺术历程时间线 */}
        {artist.timeline && artist.timeline.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground text-center mb-12 md:mb-16">
                艺术历程
              </h2>
              <Timeline items={artist.timeline} />
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              欣赏更多作品
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              浏览画廊，探索传统与现代融合的国画艺术
            </p>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              浏览作品
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </section>

        {/* FAQ 区块 - GEO 优化 */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
              常见问题
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
