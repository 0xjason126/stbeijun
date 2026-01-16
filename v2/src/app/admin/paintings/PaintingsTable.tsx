"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Painting, PaintingStatus } from "@/types";
import { togglePublished, deletePainting } from "../actions/paintings";
import { cn } from "@/lib/utils";

// 自定义下拉组件（与 gallery FilterBar 保持一致）
interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

function Dropdown({ value, options, onChange, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder || "请选择";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-11 pl-4 pr-10 rounded-xl",
          "bg-muted/80 border border-border/50",
          "text-sm font-medium text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
          "cursor-pointer transition-all duration-200",
          "hover:bg-muted hover:border-border",
          "flex items-center gap-2",
          isOpen && "ring-2 ring-primary/30 border-primary/50"
        )}
      >
        <span className={cn(!value && "text-muted-foreground")}>{displayText}</span>
        <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute top-full left-0 mt-2 z-50",
              "min-w-full w-max",
              "bg-background/95 backdrop-blur-xl",
              "border border-border rounded-xl shadow-lg",
              "py-1.5 overflow-hidden"
            )}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm",
                  "transition-colors duration-150",
                  "hover:bg-muted",
                  option.value === value
                    ? "text-primary font-medium bg-primary/5"
                    : "text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PaintingsTableProps {
  paintings: Painting[];
  years: number[];
}

export function PaintingsTable({ paintings, years }: PaintingsTableProps) {
  const [filterYear, setFilterYear] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<PaintingStatus | "">("");
  const [filterPublished, setFilterPublished] = useState<boolean | "">("");
  const [search, setSearch] = useState("");

  let filtered = paintings;

  if (filterYear) {
    filtered = filtered.filter((p) => p.year === filterYear);
  }
  if (filterStatus) {
    filtered = filtered.filter((p) => p.status === filterStatus);
  }
  if (filterPublished !== "") {
    filtered = filtered.filter((p) => p.published === filterPublished);
  }
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s)
    );
  }

  // 年份选项
  const yearOptions = [
    { value: "", label: "全部年份" },
    ...years.map((y) => ({ value: String(y), label: `${y}年` })),
  ];

  // 状态选项
  const statusOptions = [
    { value: "", label: "全部状态" },
    { value: "售卖中", label: "售卖中" },
    { value: "可定制", label: "可定制" },
    { value: "已售出", label: "已售出" },
  ];

  // 上架状态选项
  const publishedOptions = [
    { value: "", label: "全部上架状态" },
    { value: "true", label: "已上架" },
    { value: "false", label: "未上架" },
  ];

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <Dropdown
          value={filterYear ? String(filterYear) : ""}
          options={yearOptions}
          onChange={(value) => setFilterYear(value ? Number(value) : "")}
          placeholder="全部年份"
        />

        <Dropdown
          value={filterStatus}
          options={statusOptions}
          onChange={(value) => setFilterStatus(value as PaintingStatus | "")}
          placeholder="全部状态"
        />

        <Dropdown
          value={filterPublished === "" ? "" : filterPublished ? "true" : "false"}
          options={publishedOptions}
          onChange={(value) => {
            if (value === "") setFilterPublished("");
            else setFilterPublished(value === "true");
          }}
          placeholder="全部上架状态"
        />

        {/* 搜索框 */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索标题或描述..."
            className={cn(
              "w-full h-11 pl-11 pr-4 rounded-xl",
              "bg-muted/80 border border-border/50",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
              "transition-all duration-200",
              "hover:bg-muted hover:border-border"
            )}
          />
        </div>

        {/* 清除筛选按钮 */}
        {(filterYear || filterStatus || filterPublished !== "" || search) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => {
              setFilterYear("");
              setFilterStatus("");
              setFilterPublished("");
              setSearch("");
            }}
            className={cn(
              "h-11 px-5 rounded-xl",
              "text-sm font-medium text-muted-foreground",
              "hover:text-foreground hover:bg-muted",
              "transition-all duration-200",
              "flex items-center gap-2"
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            清除
          </motion.button>
        )}
      </div>

      {/* 画作列表 */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">画作</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">年份</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">状态</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">上架</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((painting) => (
              <PaintingRow key={painting.id} painting={painting} />
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            没有找到符合条件的画作
          </div>
        )}
      </div>
    </div>
  );
}

function PaintingRow({ painting }: { painting: Painting }) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  const handleToggle = () => {
    setShowPublishConfirm(true);
  };

  const confirmToggle = () => {
    startTransition(async () => {
      await togglePublished(painting.id, !painting.published);
      setShowPublishConfirm(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deletePainting(painting.id);
      setShowDeleteConfirm(false);
    });
  };

  const statusColors = {
    售卖中: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    可定制: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    已售出: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <tr className={isPending ? "opacity-50" : ""}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={painting.thumbnailUrl || painting.imageUrl}
              alt={painting.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{painting.title}</p>
            <p className="text-sm text-muted-foreground truncate md:hidden">
              {painting.year} · {painting.status}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
        {painting.year}
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusColors[painting.status])}>
          {painting.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "relative w-10 h-5 rounded-full transition-colors",
            painting.published ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
              painting.published ? "left-5" : "left-0.5"
            )}
          />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/paintings/${painting.id}`}
            className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
          >
            编辑
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            删除
          </button>
        </div>

        {/* 上架确认弹窗 */}
        {showPublishConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-foreground">
                {painting.published ? "确认下架" : "确认上架"}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {painting.published
                  ? `确定要下架《${painting.title}》吗？下架后前台将不再显示此画作。`
                  : `确定要上架《${painting.title}》吗？上架后前台将显示此画作。`}
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowPublishConfirm(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmToggle}
                  disabled={isPending}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? "处理中..." : "确认"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 删除确认弹窗 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card border border-border rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-foreground">确认删除</h3>
              <p className="mt-2 text-muted-foreground">
                确定要删除《{painting.title}》吗？此操作不可撤销。
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? "删除中..." : "确认删除"}
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}
