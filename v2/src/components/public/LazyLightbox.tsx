"use client";

import dynamic from "next/dynamic";
import type { Painting } from "@/types";

interface LightboxProps {
  painting: Painting | null;
  paintings: Painting[];
  onClose: () => void;
  onNavigate: (painting: Painting) => void;
}

// 动态导入 Lightbox 减少首屏包体积
const LightboxContent = dynamic(
  () => import("./Lightbox").then((mod) => ({ default: mod.Lightbox })),
  {
    ssr: false,
    loading: () => null,
  }
);

export function LazyLightbox(props: LightboxProps) {
  if (!props.painting) return null;
  return <LightboxContent {...props} />;
}
