"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { Artist, TimelineItem } from "@/types";
import { updateArtist } from "../actions/artist";
import { cn } from "@/lib/utils";

interface ArtistFormProps {
  artist: Artist;
}

export function ArtistForm({ artist }: ArtistFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(artist.avatarUrl);
  const [timeline, setTimeline] = useState<TimelineItem[]>(artist.timeline || []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const bio = formData.get("bio") as string;
    const avatarUrlValue = formData.get("avatarUrl") as string;

    startTransition(async () => {
      await updateArtist({
        name,
        title: title || undefined,
        bio,
        avatarUrl: avatarUrlValue,
        timeline: timeline.length > 0 ? timeline : undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  }

  // 添加时间线条目
  const addTimelineItem = () => {
    const newItem: TimelineItem = { year: new Date().getFullYear(), title: "" };
    setTimeline([...timeline, newItem]);
  };

  // 更新时间线条目
  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string | number) => {
    const updated = [...timeline];
    const current = updated[index];
    if (current) {
      updated[index] = { ...current, [field]: value };
      setTimeline(updated);
    }
  };

  // 删除时间线条目
  const removeTimelineItem = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  // 上移时间线条目
  const moveTimelineItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === timeline.length - 1) return;

    const updated = [...timeline];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    const target = updated[newIndex];
    if (temp && target) {
      updated[index] = target;
      updated[newIndex] = temp;
      setTimeline(updated);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 基本信息区块 */}
      <section className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">基本信息</h2>

        {/* 头像预览 */}
        <div className="flex items-start gap-6 mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-border">
            <Image
              src={avatarUrl}
              alt={artist.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-foreground mb-1.5">
              头像 URL
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* 姓名 */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
            姓名 *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={artist.name}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* 头衔 */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
            头衔
          </label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={artist.title ?? ""}
            placeholder="例如：当代国画艺术家"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* 简介 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-foreground mb-1.5">
            简介（支持 HTML）
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={8}
            defaultValue={artist.bio}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            支持基础 HTML 标签：&lt;p&gt;、&lt;strong&gt;、&lt;em&gt;、&lt;br&gt;、&lt;ul&gt;、&lt;li&gt;
          </p>
        </div>
      </section>

      {/* 艺术历程区块 */}
      <section className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">艺术历程</h2>
            <p className="text-sm text-muted-foreground mt-1">
              添加重要的艺术经历和里程碑事件
            </p>
          </div>
          <button
            type="button"
            onClick={addTimelineItem}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            添加条目
          </button>
        </div>

        {timeline.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无艺术历程，点击"添加条目"开始添加
          </div>
        ) : (
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="bg-muted/30 border border-border rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  {/* 年份 */}
                  <div className="w-24 flex-shrink-0">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      年份
                    </label>
                    <input
                      type="number"
                      value={item.year}
                      onChange={(e) => updateTimelineItem(index, "year", parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* 标题和描述 */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        事件标题 *
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateTimelineItem(index, "title", e.target.value)}
                        placeholder="例如：加入中国美术家协会"
                        className="w-full px-2 py-1.5 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        详细描述（可选）
                      </label>
                      <input
                        type="text"
                        value={item.description || ""}
                        onChange={(e) => updateTimelineItem(index, "description", e.target.value)}
                        placeholder="补充说明..."
                        className="w-full px-2 py-1.5 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveTimelineItem(index, "up")}
                      disabled={index === 0}
                      className={cn(
                        "p-1.5 rounded hover:bg-muted transition-colors",
                        index === 0 ? "opacity-30 cursor-not-allowed" : ""
                      )}
                      title="上移"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTimelineItem(index, "down")}
                      disabled={index === timeline.length - 1}
                      className={cn(
                        "p-1.5 rounded hover:bg-muted transition-colors",
                        index === timeline.length - 1 ? "opacity-30 cursor-not-allowed" : ""
                      )}
                      title="下移"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTimelineItem(index)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 按钮 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存修改"}
        </button>
      </div>

      {/* 成功提示 */}
      {success && (
        <div className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm">
          保存成功
        </div>
      )}
    </form>
  );
}
