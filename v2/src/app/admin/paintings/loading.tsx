export default function PaintingsLoading() {
  return (
    <div className="p-6 lg:p-8 animate-pulse">
      {/* 标题骨架 */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-10 w-24 bg-muted rounded" />
      </div>

      {/* 筛选栏骨架 */}
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-32 bg-muted rounded" />
        <div className="h-10 w-32 bg-muted rounded" />
        <div className="h-10 w-32 bg-muted rounded" />
        <div className="h-10 flex-1 bg-muted rounded" />
      </div>

      {/* 表格骨架 */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* 表头 */}
        <div className="bg-muted/50 h-12 flex items-center px-4 gap-4">
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>

        {/* 表格行 */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-20 border-t border-border flex items-center px-4 gap-4"
          >
            <div className="h-14 w-14 bg-muted rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="h-4 w-12 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded-full" />
            <div className="h-6 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
