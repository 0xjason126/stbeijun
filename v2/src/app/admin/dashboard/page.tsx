import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPaintings } from "@/lib/data";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const allPaintings = await getPaintings({});
  const publishedPaintings = allPaintings.filter((p) => p.published);

  const stats = {
    total: allPaintings.length,
    published: publishedPaintings.length,
    forSale: allPaintings.filter((p) => p.status === "售卖中").length,
    customizable: allPaintings.filter((p) => p.status === "可定制").length,
    sold: allPaintings.filter((p) => p.status === "已售出").length,
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">仪表盘</h1>
        <p className="text-muted-foreground mt-1">欢迎回来，{session.user?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="画作总数" value={stats.total} />
        <StatCard label="已上架" value={stats.published} color="green" />
        <StatCard label="售卖中" value={stats.forSale} color="blue" />
        <StatCard label="可定制" value={stats.customizable} color="amber" />
        <StatCard label="已售出" value={stats.sold} color="gray" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <QuickAction
          href="/admin/paintings"
          title="管理画作"
          description="添加、编辑或删除画作"
          icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
        <QuickAction
          href="/admin/home"
          title="首页配置"
          description="编辑首页 Hero 和精选画作"
          icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
        <QuickAction
          href="/admin/artist"
          title="画家信息"
          description="编辑画家简介和头像"
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
        <QuickAction
          href="/"
          title="查看网站"
          description="在新窗口中预览网站"
          icon="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          external
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "primary",
}: {
  label: string;
  value: number;
  color?: "primary" | "green" | "blue" | "amber" | "gray";
}) {
  const colorStyles = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green-500/10 text-green-600",
    blue: "bg-blue-500/10 text-blue-600",
    amber: "bg-amber-500/10 text-amber-600",
    gray: "bg-gray-500/10 text-gray-600",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${colorStyles[color]}`}>
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
  external,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  external?: boolean;
}) {
  const Component = external ? "a" : Link;
  const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Component
      href={href}
      {...extraProps}
      className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
    >
      <div className="p-2 bg-primary/10 rounded-lg">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </Component>
  );
}
