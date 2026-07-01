"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { CalendarDays, LogOut, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { fileToAvatarDataUrl } from "@/lib/image";
import { cn } from "@/lib/cn";

const PRESET_AVATARS = Array.from({ length: 8 }, (_, i) => `/avatars/preset-${i + 1}.svg`);

const FITNESS_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

const BOTTLES = [
  { ml: 250, label: "Cup · 250 ml" },
  { ml: 500, label: "Small · 500 ml" },
  { ml: 750, label: "Sport · 750 ml" },
  { ml: 1000, label: "Large · 1 L" },
  { ml: 1900, label: "Half gallon" },
  { ml: 3800, label: "Gallon" },
];

const GOALS = [1500, 2000, 2500, 3000, 4000];

interface Profile {
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  fitnessLevel: (typeof FITNESS_LEVELS)[number]["value"];
  weightGoalKg: number | null;
  bottleMl: number;
  waterGoalMl: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data.user))
      .catch(() => setMessage({ text: "Couldn't load your profile.", error: true }));
  }, []);

  async function saveProfile(patch: Partial<Profile>) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProfile(data.user);
      setMessage({ text: "Saved" });
    } catch {
      setMessage({ text: "Couldn't save changes. Check your connection.", error: true });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await saveProfile({ avatarUrl: dataUrl });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Couldn't process that photo",
        error: true,
      });
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    saveProfile({
      name: profile.name,
      fitnessLevel: profile.fitnessLevel,
      weightGoalKg: profile.weightGoalKg,
      bottleMl: profile.bottleMl,
      waterGoalMl: profile.waterGoalMl,
    });
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-3 py-2">
        <div className="h-64 animate-pulse rounded-3xl bg-surface" />
        <div className="h-64 animate-pulse rounded-3xl bg-surface" />
      </div>
    );
  }

  return (
    <div className="stagger flex flex-col gap-5">
      <Toast
        message={message?.text ?? ""}
        visible={!!message}
        onDismiss={() => setMessage(null)}
        variant={message?.error ? "error" : "info"}
      />

      <Card className="text-center">
        <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-white/20">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-2 text-xl text-muted">☺</div>
          )}
        </div>
        <p className="font-bold text-white">@{profile.username}</p>
        <p className="text-xs text-muted">{profile.email}</p>

        <div className="mx-auto mt-4 grid max-w-[280px] grid-cols-4 gap-2">
          {PRESET_AVATARS.map((url) => (
            <button
              key={url}
              onClick={() => saveProfile({ avatarUrl: url })}
              className={cn(
                "overflow-hidden rounded-full border-2 transition-all duration-150 active:scale-90",
                profile.avatarUrl === url ? "border-white" : "border-transparent hover:border-white/30"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Preset avatar" className="h-full w-full" />
            </button>
          ))}
        </div>

        <label className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-white underline-offset-4 hover:underline">
          <Upload size={13} />
          {uploading ? "Processing…" : "Upload a photo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </Card>

      <Card title="Training">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name">
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-2xl border border-line bg-surface-2 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-white/40"
            />
          </Field>
          <Field label="Fitness level">
            <div className="grid grid-cols-3 gap-2">
              {FITNESS_LEVELS.map((lvl) => (
                <PillOption
                  key={lvl.value}
                  active={profile.fitnessLevel === lvl.value}
                  onClick={() => setProfile({ ...profile, fitnessLevel: lvl.value })}
                >
                  {lvl.label}
                </PillOption>
              ))}
            </div>
          </Field>
          <Field label="Weight goal (kg)">
            <input
              type="number"
              min={0}
              step="0.1"
              value={profile.weightGoalKg ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, weightGoalKg: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full rounded-2xl border border-line bg-surface-2 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-white/40"
            />
          </Field>

          <Field label="Your bottle">
            <div className="grid grid-cols-3 gap-2">
              {BOTTLES.map((b) => (
                <PillOption
                  key={b.ml}
                  active={profile.bottleMl === b.ml}
                  onClick={() => setProfile({ ...profile, bottleMl: b.ml })}
                >
                  {b.label}
                </PillOption>
              ))}
            </div>
          </Field>
          <Field label="Daily water goal">
            <div className="grid grid-cols-5 gap-2">
              {GOALS.map((g) => (
                <PillOption
                  key={g}
                  active={profile.waterGoalMl === g}
                  onClick={() => setProfile({ ...profile, waterGoalMl: g })}
                >
                  {(g / 1000).toFixed(1).replace(/\.0$/, "")}L
                </PillOption>
              ))}
            </div>
          </Field>

          <Button type="submit" disabled={saving} className="mt-1 w-full">
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Card>

      <Link href="/workout" className="block">
        <Card className="flex items-center gap-3 py-4 transition-colors hover:border-white/25">
          <CalendarDays size={18} className="text-muted" />
          <span className="flex-1 text-sm font-semibold text-white">Edit training week</span>
          <span className="text-xs text-faint">On the Train tab</span>
        </Card>
      </Link>

      <Button variant="danger" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
        <LogOut size={15} /> Log out
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>
      {children}
    </div>
  );
}

function PillOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-2 py-2.5 text-[12px] font-semibold transition-all duration-150 active:scale-95",
        active ? "border-white bg-white text-black" : "border-line bg-surface-2 text-muted hover:border-white/25"
      )}
    >
      {children}
    </button>
  );
}
