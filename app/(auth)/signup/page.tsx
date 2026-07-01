"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { NeonCard } from "@/components/ui/neon-card";
import { GlowButton } from "@/components/ui/glow-button";

const FITNESS_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    fitnessLevel: "BEGINNER" as (typeof FITNESS_LEVELS)[number]["value"],
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Account created, but login failed. Try logging in manually.");
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
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Create your account</h1>
        <NeonCard glow="purple">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-pulse-muted">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-pulse-muted">Username</label>
              <input
                required
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-pulse-muted">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-pulse-muted">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-pulse-muted">Fitness Level</label>
              <select
                value={form.fitnessLevel}
                onChange={(e) => update("fitnessLevel", e.target.value as typeof form.fitnessLevel)}
                className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
              >
                {FITNESS_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <GlowButton type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Creating account…" : "Sign Up"}
            </GlowButton>
          </form>
        </NeonCard>
        <p className="mt-4 text-center text-sm text-pulse-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-pulse-pink-light">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
