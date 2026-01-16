"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { PaintingStatus } from "@/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  years: number[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  year?: number;
  status?: PaintingStatus;
  search?: string;
}

const STATUS_OPTIONS: { value: PaintingStatus | ""; label: string }[] = [
  { value: "", label: "全部状态" },
  { value: "售卖中", label: "售卖中" },
  { value: "可定制", label: "可定制" },
  { value: "已售出", label: "已售出" },
];

// 自定义下拉组件
interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

function Dropdown({ value, options, onChange, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
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
        {/* 下拉箭头 */}
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

      {/* 下拉菜单 */}
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

export function FilterBar({ years, onFilterChange, initialFilters }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() => {
    if (initialFilters) return initialFilters;
    return {
      year: searchParams.get("year")
        ? Number(searchParams.get("year"))
        : undefined,
      status: (searchParams.get("status") as PaintingStatus) || undefined,
      search: searchParams.get("q") || undefined,
    };
  });

  const [searchInput, setSearchInput] = useState(filters.search || "");

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        updateFilters({ search: searchInput || undefined });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 更新筛选条件
  const updateFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      const updated = { ...filters, ...newFilters };

      // 清理空值
      if (!updated.year) delete updated.year;
      if (!updated.status) delete updated.status;
      if (!updated.search) delete updated.search;

      setFilters(updated);
      onFilterChange(updated);

      // 同步到 URL
      const params = new URLSearchParams();
      if (updated.year) params.set("year", String(updated.year));
      if (updated.status) params.set("status", updated.status);
      if (updated.search) params.set("q", updated.search);

      const queryString = params.toString();
      router.push(queryString ? `/gallery?${queryString}` : "/gallery", {
        scroll: false,
      });
    },
    [filters, onFilterChange, router]
  );

  // 年份选项
  const yearOptions = [
    { value: "", label: "全部年份" },
    ...years.map((year) => ({ value: String(year), label: `${year}年` })),
  ];

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* 年份筛选 - 自定义下拉 */}
          <Dropdown
            value={filters.year ? String(filters.year) : ""}
            options={yearOptions}
            onChange={(value) =>
              updateFilters({ year: value ? Number(value) : undefined })
            }
            placeholder="全部年份"
          />

          {/* 状态筛选 - 自定义下拉 */}
          <Dropdown
            value={filters.status || ""}
            options={STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            onChange={(value) =>
              updateFilters({ status: (value as PaintingStatus) || undefined })
            }
            placeholder="全部状态"
          />

          {/* 搜索框 */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            {/* 搜索图标 */}
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="搜索画作..."
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

          {/* 清除筛选 */}
          {(filters.year || filters.status || filters.search) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => {
                setSearchInput("");
                updateFilters({ year: undefined, status: undefined, search: undefined });
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
      </div>
    </div>
  );
}
