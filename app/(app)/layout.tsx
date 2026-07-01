import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopHeader } from "@/components/top-header";
import { NavBar } from "@/components/nav-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader username={session.user.name ?? "you"} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      <NavBar />
    </div>
  );
}
