"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { Painting } from "@/types";
import { cn } from "@/lib/utils";

interface FeaturedGridProps {
  paintings: Painting[];
}

export function FeaturedGrid({ paintings }: FeaturedGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  // 滚动状态
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 显示所有精选画作（最多6幅）
  const displayPaintings = paintings.slice(0, 6);
  const needsScroll = displayPaintings.length > 3;

  // 检查滚动状态
  const checkScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollState);
      window.addEventListener("resize", checkScrollState);
      return () => {
        container.removeEventListener("scroll", checkScrollState);
        window.removeEventListener("resize", checkScrollState);
      };
    }
  }, [displayPaintings.length]);

  // 滚动控制
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector("div")?.offsetWidth || 300;
    const scrollAmount = cardWidth + 24; // 卡片宽度 + gap

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section ref={ref} className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 标题 */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
            精选作品
          </h2>
          <p className="mt-3 text-muted-foreground">
            探索传统与现代的艺术融合
          </p>
        </motion.div>

        {/* 画作展示区域 */}
        <div className="relative">
          {/* 左侧滚动按钮 */}
          {needsScroll && canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-10",
                "w-12 h-12 -ml-4 lg:-ml-6",
                "bg-background/90 backdrop-blur-sm border border-border",
                "rounded-full shadow-lg",
                "flex items-center justify-center",
                "text-foreground hover:bg-muted transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              aria-label="向左滚动"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* 右侧滚动按钮 */}
          {needsScroll && canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-10",
                "w-12 h-12 -mr-4 lg:-mr-6",
                "bg-background/90 backdrop-blur-sm border border-border",
                "rounded-full shadow-lg",
                "flex items-center justify-center",
                "text-foreground hover:bg-muted transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              aria-label="向右滚动"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* 画作网格/滚动容器 */}
          <div
            ref={scrollContainerRef}
            className={cn(
              needsScroll
                ? "flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mb-4"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            )}
            style={needsScroll ? { scrollbarWidth: "none", msOverflowStyle: "none" } : undefined}
          >
            {displayPaintings.map((painting, index) => (
              <motion.div
                key={painting.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={cn(
                  needsScroll
                    ? "flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px] snap-start"
                    : index === 0 ? "md:col-span-2 lg:col-span-1" : ""
                )}
              >
                <FeaturedCard painting={painting} priority={index < 3} />
              </motion.div>
            ))}
          </div>

          {/* 滚动指示器（移动端） */}
          {needsScroll && (
            <div className="flex justify-center gap-1.5 mt-6 md:hidden">
              {displayPaintings.map((_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
                />
              ))}
            </div>
          )}
        </div>

        {/* 查看更多 */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            浏览全部作品
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
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
        </motion.div>
      </div>
    </section>
  );
}

// 精选画作卡片
function FeaturedCard({
  painting,
  priority = false,
}: {
  painting: Painting;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/gallery?highlight=${painting.id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-lg cursor-pointer"
    >
      {/* 图片 */}
      <Image
        src={painting.imageUrl}
        alt={painting.title}
        fill
        priority={priority}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 信息 - 悬停显示 */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-serif text-lg md:text-xl font-semibold text-white">
          {painting.title}
        </h3>
        <p className="mt-1 text-sm text-white/80">
          {painting.year} · {painting.dimensions}
        </p>
      </div>

      {/* 默认状态下的标题（移动端） */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent md:hidden">
        <h3 className="font-serif text-base font-semibold text-white">
          {painting.title}
        </h3>
      </div>
    </Link>
  );
}
