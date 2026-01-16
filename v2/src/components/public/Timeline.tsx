"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { TimelineItem } from "@/types";

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  if (items.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      {/* 时间线竖线 */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />

      <div className="space-y-8 md:space-y-12">
        {items.map((item, index) => (
          <motion.div
            key={item.year}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative flex items-start gap-6 md:gap-8 ${
              index % 2 === 0 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* 时间点 */}
            <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1.5 md:-translate-x-1.5 mt-1.5 ring-4 ring-background" />

            {/* 内容卡片 */}
            <div
              className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                index % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
              }`}
            >
              <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded mb-2">
                  {item.year}
                </span>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
