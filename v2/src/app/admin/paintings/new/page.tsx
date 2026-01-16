import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewPaintingForm } from "./NewPaintingForm";

export default async function NewPaintingPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">添加画作</h1>
        <p className="text-muted-foreground mt-1">上传新画作到画廊</p>
      </div>

      <div className="max-w-2xl">
        <NewPaintingForm />
      </div>
    </div>
  );
}
