"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { NeonCard } from "@/components/ui/neon-card";
import { GlowButton } from "@/components/ui/glow-button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Incorrect email or password.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("No internet connection — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Welcome back</h1>
        <NeonCard glow="pink">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-pulse-muted">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-pulse-muted">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <GlowButton type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Logging in…" : "Log In"}
            </GlowButton>
          </form>
        </NeonCard>
        <p className="mt-4 text-center text-sm text-pulse-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-pulse-pink-light">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
