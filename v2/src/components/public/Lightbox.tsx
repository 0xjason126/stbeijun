"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, PanInfo } from "framer-motion";
import type { Painting } from "@/types";
import { cn } from "@/lib/utils";

interface LightboxProps {
  painting: Painting | null;
  paintings: Painting[];
  onClose: () => void;
  onNavigate: (painting: Painting) => void;
}

export function Lightbox({
  painting,
  paintings,
  onClose,
  onNavigate,
}: LightboxProps) {
  const prefersReducedMotion = useReducedMotion();
  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  // 当前画作索引
  const currentIndex = painting
    ? paintings.findIndex((p) => p.id === painting.id)
    : -1;

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!painting) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (currentIndex > 0) {
            const prev = paintings[currentIndex - 1];
            if (prev) onNavigate(prev);
          }
          break;
        case "ArrowRight":
          if (currentIndex < paintings.length - 1) {
            const next = paintings[currentIndex + 1];
            if (next) onNavigate(next);
          }
          break;
      }
    },
    [painting, currentIndex, paintings, onClose, onNavigate]
  );

  useEffect(() => {
    if (painting) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [painting, handleKeyDown]);

  // 拖拽关闭（移动端）
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  // 复制微信号
  const copyWechat = () => {
    navigator.clipboard.writeText("stbeijun0425");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!painting) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95"
        onClick={onClose}
      >
        {/* 顶部工具栏 */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
          {/* 图片计数 */}
          <div className="text-white/80 text-sm font-medium">
            {currentIndex + 1} / {paintings.length}
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="关闭"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 左箭头 */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const prev = paintings[currentIndex - 1];
              if (prev) onNavigate(prev);
            }}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="上一张"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* 右箭头 */}
        {currentIndex < paintings.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = paintings[currentIndex + 1];
              if (next) onNavigate(next);
            }}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="下一张"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* 全屏图片区域 */}
        <motion.div
          drag={prefersReducedMotion ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 flex items-center justify-center p-4 md:p-16"
        >
          <div className="relative w-full h-full">
            <Image
              src={painting.imageUrl}
              alt={painting.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </motion.div>

        {/* 底部信息面板 */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 left-0 right-0 z-20"
        >
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          <div className="relative px-4 md:px-8 pb-6 pt-16">
            <div className="max-w-4xl mx-auto">
              {/* 标题行 */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white">
                    {painting.title}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
                    <span>{painting.year}</span>
                    {painting.dimensions && (
                      <>
                        <span className="hidden sm:inline">·</span>
                        <span>{painting.dimensions}</span>
                      </>
                    )}
                    <span className="hidden sm:inline">·</span>
                    <StatusBadgeInline status={painting.status} />
                  </div>
                </div>

                {/* 咨询按钮 */}
                <button
                  onClick={() => setShowContact(!showContact)}
                  className={cn(
                    "px-6 py-2.5 rounded-full font-medium transition-all",
                    showContact
                      ? "bg-white text-black"
                      : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                  )}
                >
                  咨询购买
                </button>
              </div>

              {/* 描述（如有） */}
              {painting.description && (
                <p className="mt-3 text-sm text-white/60 max-w-2xl line-clamp-2">
                  {painting.description}
                </p>
              )}

              {/* 联系方式弹出 */}
              <AnimatePresence>
                {showContact && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                      <div className="flex-1">
                        <p className="text-xs text-white/60 mb-1">添加微信咨询</p>
                        <code className="text-white font-mono">stbeijun0425</code>
                      </div>
                      <button
                        onClick={copyWechat}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                          copied
                            ? "bg-green-500 text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        )}
                      >
                        {copied ? "已复制" : "复制"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// 内联状态标签（深色背景适配）
function StatusBadgeInline({ status }: { status: Painting["status"] }) {
  const statusStyles = {
    售卖中: "text-green-400",
    可定制: "text-blue-400",
    已售出: "text-white/50",
  };

  return <span className={cn("font-medium", statusStyles[status])}>{status}</span>;
}
