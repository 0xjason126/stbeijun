import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getArtist } from "@/lib/data";
import { ArtistForm } from "./ArtistForm";

export default async function ArtistConfigPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const artist = await getArtist();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold text-foreground">画家信息</h1>
        <p className="text-muted-foreground mt-1">编辑画家简介和头像</p>
      </div>

      <div className="max-w-2xl">
        <ArtistForm artist={artist} />
      </div>
    </div>
  );
}
