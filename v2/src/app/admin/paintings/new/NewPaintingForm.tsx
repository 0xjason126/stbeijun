"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { PaintingStatus } from "@/types";
import { createPainting } from "../../actions/paintings";
import { cn } from "@/lib/utils";

interface UploadedImage {
  imageUrl: string;
  thumbnailUrl: string;
}

export function NewPaintingForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // 上传文件到 Supabase Storage
  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);

      // 本地预览
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("year", String(selectedYear));

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "上传失败");
        }

        const result = await response.json();
        setUploadedImage({
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
        });
        setPreviewUrl(result.imageUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "上传失败");
        setUploadedImage(null);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
      }
    },
    [selectedYear]
  );

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadFile(file);
    }
  };

  // 提交表单
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

    if (!uploadedImage) {
      setError("请先上传图片");
      return;
    }

    startTransition(async () => {
      const result = await createPainting({
        title: title.trim(),
        description: description.trim(),
        year,
        status,
        dimensions: dimensions.trim() || undefined,
        imageUrl: uploadedImage.imageUrl,
        thumbnailUrl: uploadedImage.thumbnailUrl,
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
      {/* 图片上传区域 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          画作图片 *
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-input hover:border-primary/50 hover:bg-muted/50",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <div className="py-8">
              <div className="w-12 h-12 mx-auto border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">上传中...</p>
            </div>
          ) : previewUrl ? (
            <div className="relative w-48 h-60 mx-auto rounded-lg overflow-hidden bg-muted">
              <Image
                src={previewUrl}
                alt="预览"
                fill
                className="object-cover"
                sizes="192px"
              />
              {uploadedImage && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8">
              <svg
                className="w-12 h-12 mx-auto text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-muted-foreground">
                点击或拖拽图片到此处上传
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                支持 JPEG、PNG、WebP，最大 10MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {uploadedImage && (
          <p className="mt-2 text-xs text-green-600">
            图片已上传至 Supabase Storage
          </p>
        )}
      </div>

      {/* 标题 */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          标题 *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* 描述 */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          描述
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      {/* 年份和状态 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            年份
          </label>
          <select
            id="year"
            name="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            状态
          </label>
          <select
            id="status"
            name="status"
            defaultValue="售卖中"
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
        <label
          htmlFor="dimensions"
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          尺寸
        </label>
        <input
          id="dimensions"
          name="dimensions"
          type="text"
          placeholder="例如：68cm × 136cm"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* 按钮 */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending || isUploading || !uploadedImage}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "创建中..." : "创建画作"}
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
