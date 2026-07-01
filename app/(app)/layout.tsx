import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopHeader } from "@/components/top-header";
import { NavBar } from "@/components/nav-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentStreak: true, avatarUrl: true, onboarded: true },
  });
  if (!user) redirect("/login");
  if (!user.onboarded) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader streak={user.currentStreak} avatarUrl={user.avatarUrl} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
      <NavBar />
    </div>
  );
}
