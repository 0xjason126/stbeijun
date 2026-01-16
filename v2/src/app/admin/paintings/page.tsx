import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPaintings, getYears } from "@/lib/data";
import Link from "next/link";
import { PaintingsTable } from "./PaintingsTable";

export default async function PaintingsPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [paintings, years] = await Promise.all([
    getPaintings({ published: undefined }),
    getYears(),
  ]);

  // 获取所有画作（包括未上架的）
  const allPaintings = paintings;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">画作管理</h1>
          <p className="text-muted-foreground mt-1">共 {allPaintings.length} 幅画作</p>
        </div>
        <Link
          href="/admin/paintings/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          添加画作
        </Link>
      </div>

      <PaintingsTable paintings={allPaintings} years={years} />
    </div>
  );
}
