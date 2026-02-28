import CreatorSidebar from "@/components/creator/common/sidebar";
import { apiServerGet } from "@/lib/api/server";
import { MeResponse } from "@/lib/auth/getMe";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const me = await apiServerGet<MeResponse>("/api/auth/me");
    if (!me.ok) redirect("/login");
  } catch {
    redirect("/login");
  }

  return (
    <div
      id="dashboard-layout"
      className="flex h-screen flex-col lg:flex-row bg-black"
    >
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
