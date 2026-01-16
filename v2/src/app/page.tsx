import { Navbar, ScrollProgress, Footer, Hero, ArtistStatement, FeaturedGrid, ArtGallerySchema } from "@/components/public";
import { getHomeSettings, getFeaturedPaintings } from "@/lib/data";

export const revalidate = 60; // ISR: 60 秒重验证

export default async function HomePage() {
  const homeSettings = await getHomeSettings();
  const featuredPaintings = await getFeaturedPaintings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://beijun.art";

  return (
    <>
      {/* 结构化数据 */}
      <ArtGallerySchema siteUrl={siteUrl} artistName="贝军" />

      <ScrollProgress />
      <Navbar transparent />

      <main>
        {/* Hero 区域 */}
        <Hero
          backgroundImage={homeSettings.hero.backgroundImage}
          title={homeSettings.hero.title}
          subtitle={homeSettings.hero.subtitle}
        />

        {/* 艺术理念章节 */}
        {homeSettings.artistStatement && (
          <ArtistStatement statement={homeSettings.artistStatement} />
        )}

        {/* 精选画作 */}
        <FeaturedGrid paintings={featuredPaintings} />
      </main>

      <Footer />
    </>
  );
}
