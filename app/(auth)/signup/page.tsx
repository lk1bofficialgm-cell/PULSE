"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
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
        body: JSON.stringify({ ...form, fitnessLevel: "BEGINNER" }),
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
      // The onboarding quiz sets fitness level, schedule, and water setup
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("No internet connection — please try again.");
    } finally {
      setPending(false);
    }
  }

  const fields = [
    { key: "name" as const, label: "Name", type: "text", required: true },
    { key: "username" as const, label: "Username", type: "text", required: true },
    { key: "email" as const, label: "Email", type: "email", required: true },
    { key: "password" as const, label: "Password", type: "password", required: true, minLength: 8 },
  ];

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm animate-fade-in-up">
        <h1 className="mb-1 text-center text-2xl font-black text-white">Create your account</h1>
        <p className="mb-6 text-center text-sm text-muted">Then a 60-second quiz builds your plan.</p>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1.5 block text-xs font-semibold text-muted">{f.label}</label>
                <input
                  type={f.type}
                  required={f.required}
                  minLength={f.minLength}
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-2xl border border-line bg-surface-2 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-white/40"
                />
              </div>
            ))}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={pending} className="mt-2 w-full">
              {pending ? "Creating account…" : "Sign Up"}
            </Button>
          </form>
        </Card>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-white underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
