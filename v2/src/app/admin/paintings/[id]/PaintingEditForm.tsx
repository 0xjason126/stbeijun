"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Painting, PaintingStatus } from "@/types";
import { updatePainting } from "../../actions/paintings";

interface PaintingEditFormProps {
  painting: Painting;
}

export function PaintingEditForm({ painting }: PaintingEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const year = Number(formData.get("year"));
    const status = formData.get("status") as PaintingStatus;
    const dimensions = formData.get("dimensions") as string;

    if (!title.trim()) {
      setError("标题不能为空");
      return;
    }

    startTransition(async () => {
      const result = await updatePainting(painting.id, {
        title: title.trim(),
        description: description.trim(),
        year,
        status,
        dimensions: dimensions.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/paintings");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 画作预览 */}
      <div className="flex items-start gap-6">
        <div className="relative w-32 h-40 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={painting.imageUrl}
            alt={painting.title}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <p>ID: {painting.id}</p>
          <p>创建时间: {new Date(painting.createdAt).toLocaleDateString("zh-CN")}</p>
          <p>更新时间: {new Date(painting.updatedAt).toLocaleDateString("zh-CN")}</p>
        </div>
      </div>

      {/* 标题 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1.5">
          标题 *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={painting.title}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 描述 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1.5">
          描述
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={painting.description}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      {/* 年份和状态 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-foreground mb-1.5">
            年份
          </label>
          <select
            id="year"
            name="year"
            defaultValue={painting.year}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-foreground mb-1.5">
            状态
          </label>
          <select
            id="status"
            name="status"
            defaultValue={painting.status}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="售卖中">售卖中</option>
            <option value="可定制">可定制</option>
            <option value="已售出">已售出</option>
          </select>
        </div>
      </div>

      {/* 尺寸 */}
      <div>
        <label htmlFor="dimensions" className="block text-sm font-medium text-foreground mb-1.5">
          尺寸
        </label>
        <input
          id="dimensions"
          name="dimensions"
          type="text"
          placeholder="例如：68cm × 136cm"
          defaultValue={painting.dimensions ?? ""}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* 按钮 */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "保存中..." : "保存修改"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
