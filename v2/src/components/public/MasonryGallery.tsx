"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { Painting } from "@/types";
import { cn } from "@/lib/utils";

interface MasonryGalleryProps {
  paintings: Painting[];
  onPaintingClick: (painting: Painting) => void;
  highlightId?: string | undefined;
}

export function MasonryGallery({
  paintings,
  onPaintingClick,
  highlightId,
}: MasonryGalleryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  if (paintings.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">没有找到符合条件的画作</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6"
    >
      {paintings.map((painting, index) => (
        <motion.div
          key={painting.id}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
          className="break-inside-avoid"
        >
          <PaintingCard
            painting={painting}
            onClick={() => onPaintingClick(painting)}
            isHighlighted={painting.id === highlightId}
          />
        </motion.div>
      ))}
    </div>
  );
}

// 画作卡片组件
function PaintingCard({
  painting,
  onClick,
  isHighlighted,
}: {
  painting: Painting;
  onClick: () => void;
  isHighlighted?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg bg-muted cursor-pointer text-left transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {/* 图片 */}
      <div className="relative aspect-[3/4]">
        <Image
          src={painting.thumbnailUrl || painting.imageUrl}
          alt={painting.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          loading="lazy"
        />

        {/* 状态标签 */}
        <StatusBadge status={painting.status} />

        {/* 渐变遮罩 - 悬停显示 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 信息 - 悬停显示 */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-serif text-lg font-semibold text-white line-clamp-1">
            {painting.title}
          </h3>
          <p className="mt-1 text-sm text-white/80">
            {painting.year}
            {painting.dimensions && ` · ${painting.dimensions}`}
          </p>
        </div>
      </div>
    </button>
  );
}

// 状态标签
function StatusBadge({ status }: { status: Painting["status"] }) {
  const statusStyles = {
    售卖中: "bg-green-500/90 text-white",
    可定制: "bg-blue-500/90 text-white",
    已售出: "bg-gray-500/90 text-white",
  };

  return (
    <span
      className={cn(
        "absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}
