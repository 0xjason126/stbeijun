"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface ArtistStatementProps {
  statement: string;
}

export function ArtistStatement({ statement }: ArtistStatementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      className="py-24 md:py-32 lg:py-40 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* 装饰线 */}
          <motion.div
            initial={prefersReducedMotion ? {} : { scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-0.5 bg-primary mx-auto mb-8"
          />

          {/* 艺术理念文案 */}
          <blockquote className="font-serif text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed">
            <span className="text-primary text-4xl leading-none">"</span>
            {statement}
            <span className="text-primary text-4xl leading-none">"</span>
          </blockquote>

          {/* 签名 */}
          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 text-muted-foreground"
          >
            — 贝军
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
