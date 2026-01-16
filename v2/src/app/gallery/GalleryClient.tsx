"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Navbar,
  ScrollProgress,
  Footer,
  FilterBar,
  MasonryGallery,
  Lightbox,
  type FilterState,
} from "@/components/public";
import type { Painting, PaintingStatus } from "@/types";

interface GalleryClientProps {
  initialPaintings: Painting[];
  years: number[];
}

function GalleryContent({ initialPaintings, years }: GalleryClientProps) {
  const searchParams = useSearchParams();
  const [paintings, setPaintings] = useState(initialPaintings);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const highlightId = searchParams.get("highlight") ?? undefined;

  // 初始筛选条件从 URL 获取
  const [filters, setFilters] = useState<FilterState>(() => {
    const yearParam = searchParams.get("year");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("q");

    const result: FilterState = {};
    if (yearParam) result.year = Number(yearParam);
    if (statusParam) result.status = statusParam as PaintingStatus;
    if (searchParam) result.search = searchParam;
    return result;
  });

  // 高亮画作自动打开 Lightbox
  useEffect(() => {
    if (highlightId) {
      const painting = initialPaintings.find((p) => p.id === highlightId);
      if (painting) {
        setSelectedPainting(painting);
      }
    }
  }, [highlightId, initialPaintings]);

  // 客户端筛选
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);

    let filtered = initialPaintings;

    if (newFilters.year) {
      filtered = filtered.filter((p) => p.year === newFilters.year);
    }

    if (newFilters.status) {
      filtered = filtered.filter((p) => p.status === newFilters.status);
    }

    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    setPaintings(filtered);
  };

  return (
    <>
      <ScrollProgress />
      <Navbar />

      <main className="pt-24 lg:pt-28 min-h-screen">
        {/* 页面标题 */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
              作品画廊
            </h1>
            <p className="mt-3 text-muted-foreground">
              浏览贝军先生的国画作品集
            </p>
          </div>
        </section>

        {/* 筛选栏 */}
        <FilterBar
          years={years}
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />

        {/* 画廊网格 */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <MasonryGallery
              paintings={paintings}
              onPaintingClick={setSelectedPainting}
              highlightId={highlightId}
            />
          </div>
        </section>

        {/* Lightbox */}
        <Lightbox
          painting={selectedPainting}
          paintings={paintings}
          onClose={() => setSelectedPainting(null)}
          onNavigate={setSelectedPainting}
        />
      </main>

      <Footer />
    </>
  );
}

export function GalleryClient(props: GalleryClientProps) {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryContent {...props} />
    </Suspense>
  );
}

function GalleryLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-ink-spread w-16 h-16 rounded-full bg-primary/30" />
    </div>
  );
}
