"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { HomeSettings, Painting } from "@/types";
import { updateHomeSettings, updateFeaturedPaintings } from "../actions/home";
import { cn } from "@/lib/utils";

interface HomeConfigFormProps {
  homeSettings: HomeSettings;
  paintings: Painting[];
}

export function HomeConfigForm({ homeSettings, paintings }: HomeConfigFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(homeSettings.featuredPaintingIds);

  // Hero 背景图状态
  const [heroTitle, setHeroTitle] = useState(homeSettings.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(homeSettings.hero.subtitle ?? "");
  const [heroBackgroundImage, setHeroBackgroundImage] = useState(homeSettings.hero.backgroundImage);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleHeroSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);

    startTransition(async () => {
      await updateHomeSettings({
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle || undefined,
          backgroundImage: heroBackgroundImage,
        },
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  const handleFeaturedSubmit = () => {
    setSuccess(false);
    startTransition(async () => {
      await updateFeaturedPaintings(selectedIds);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 6) {
        return prev;
      }
      return [...prev, id];
    });
  };

  // 选择背景图
  const selectBackgroundImage = (imageUrl: string) => {
    setHeroBackgroundImage(imageUrl);
    setShowImagePicker(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero 编辑 */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Hero 区域</h2>
        <form onSubmit={handleHeroSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
                主标题
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-foreground mb-1.5">
                副标题
              </label>
              <input
                id="subtitle"
                name="subtitle"
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* 背景图选择 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              背景图片
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              从已上传的画作中选择一张作为首页背景
            </p>

            {/* 当前选中的背景图预览 */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-48 h-32 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                {heroBackgroundImage ? (
                  <Image
                    src={heroBackgroundImage}
                    alt="当前背景图"
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    未选择
                  </div>
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className="px-4 py-2 border border-input rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  {showImagePicker ? "收起" : "选择图片"}
                </button>
                {heroBackgroundImage && (
                  <p className="mt-2 text-xs text-muted-foreground truncate max-w-xs">
                    {heroBackgroundImage.split("/").pop()}
                  </p>
                )}
              </div>
            </div>

            {/* 图片选择网格 */}
            {showImagePicker && (
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">点击选择一张画作作为背景：</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                  {paintings.map((painting) => {
                    const isSelected = heroBackgroundImage === painting.imageUrl;
                    return (
                      <button
                        key={painting.id}
                        type="button"
                        onClick={() => selectBackgroundImage(painting.imageUrl)}
                        className={cn(
                          "relative aspect-[4/3] rounded-md overflow-hidden border-2 transition-all",
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-muted-foreground/30"
                        )}
                      >
                        <Image
                          src={painting.thumbnailUrl || painting.imageUrl}
                          alt={painting.title}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "保存中..." : "保存 Hero 设置"}
          </button>
        </form>
      </section>

      {/* 精选画作 */}
      <section className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">精选画作</h2>
            <p className="text-sm text-muted-foreground mt-1">
              选择 3-6 幅画作显示在首页（已选 {selectedIds.length}/6）
            </p>
          </div>
          <button
            onClick={handleFeaturedSubmit}
            disabled={isPending || selectedIds.length < 3}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "保存中..." : "保存精选"}
          </button>
        </div>

        {/* 已选择的画作 */}
        {selectedIds.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground mb-2">已选择：</p>
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id, index) => {
                const painting = paintings.find((p) => p.id === id);
                return painting ? (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    <span>{index + 1}. {painting.title}</span>
                    <button
                      onClick={() => toggleSelection(id)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* 画作选择网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {paintings.map((painting) => {
            const isSelected = selectedIds.includes(painting.id);
            const index = selectedIds.indexOf(painting.id);

            return (
              <button
                key={painting.id}
                onClick={() => toggleSelection(painting.id)}
                className={cn(
                  "relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all",
                  isSelected ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted"
                )}
              >
                <Image
                  src={painting.thumbnailUrl || painting.imageUrl}
                  alt={painting.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />
                {isSelected && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-xs truncate">{painting.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 成功提示 */}
      {success && (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg">
          保存成功
        </div>
      )}
    </div>
  );
}
