export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8 animate-pulse">
      {/* 标题 */}
      <div className="h-8 w-40 bg-muted rounded mb-8" />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border border-border rounded-lg">
            <div className="h-4 w-20 bg-muted rounded mb-2" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* 快捷操作 */}
      <div className="h-6 w-24 bg-muted rounded mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
