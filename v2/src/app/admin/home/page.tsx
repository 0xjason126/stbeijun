import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHomeSettings, getPaintings } from "@/lib/data";
import { HomeConfigForm } from "./HomeConfigForm";

export default async function HomeConfigPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const [homeSettings, allPaintings] = await Promise.all([
    getHomeSettings(),
    getPaintings({ published: true }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">首页配置</h1>
        <p className="text-muted-foreground mt-1">编辑首页 Hero 区域和精选画作</p>
      </div>

      <HomeConfigForm homeSettings={homeSettings} paintings={allPaintings} />
    </div>
  );
}
