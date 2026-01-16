import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPaintingById } from "@/lib/data";
import { PaintingEditForm } from "./PaintingEditForm";

export default async function PaintingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const painting = await getPaintingById(id);

  if (!painting) {
    redirect("/admin/paintings");
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">编辑画作</h1>
        <p className="text-muted-foreground mt-1">修改《{painting.title}》的信息</p>
      </div>

      <div className="max-w-2xl">
        <PaintingEditForm painting={painting} />
      </div>
    </div>
  );
}
