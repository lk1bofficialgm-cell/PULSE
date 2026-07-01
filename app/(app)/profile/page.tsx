"use client";

import { useEffect, useState, type FormEvent } from "react";
import { NeonCard } from "@/components/ui/neon-card";
import { GlowButton } from "@/components/ui/glow-button";
import { Toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

const PRESET_AVATARS = Array.from({ length: 8 }, (_, i) => `/avatars/preset-${i + 1}.svg`);

const FITNESS_LEVELS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
] as const;

interface Profile {
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  fitnessLevel: (typeof FITNESS_LEVELS)[number]["value"];
  weightGoalKg: number | null;
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
      setMessage({ text: "Saved!" });
    } catch {
      setMessage({ text: "Couldn't save changes. Check your connection.", error: true });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: FormEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/avatar", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload failed");
      }
      const data = await res.json();
      await saveProfile({ avatarUrl: data.avatarUrl });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Upload failed", error: true });
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
    });
  }

  if (!profile) {
    return <p className="text-center text-sm text-pulse-muted">Loading profile…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <Toast
        message={message?.text ?? ""}
        visible={!!message}
        onDismiss={() => setMessage(null)}
        variant={message?.error ? "error" : "info"}
      />

      <NeonCard glow="pink" className="text-center">
        <div className="mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-pulse-pink">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-pulse-surface-2 text-2xl">🙂</div>
          )}
        </div>
        <p className="font-bold text-white">@{profile.username}</p>
        <p className="text-xs text-pulse-muted">{profile.email}</p>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {PRESET_AVATARS.map((url) => (
            <button
              key={url}
              onClick={() => saveProfile({ avatarUrl: url })}
              className={cn(
                "overflow-hidden rounded-full border-2 transition-colors",
                profile.avatarUrl === url ? "border-pulse-pink" : "border-transparent hover:border-white/30"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Preset avatar" className="h-full w-full" />
            </button>
          ))}
        </div>

        <label className="mt-3 inline-block cursor-pointer text-xs font-medium text-pulse-pink-light">
          {uploading ? "Uploading…" : "Upload your own"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </NeonCard>

      <NeonCard glow="purple">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-pulse-muted">Name</label>
            <input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-pulse-muted">Fitness Level</label>
            <select
              value={profile.fitnessLevel}
              onChange={(e) =>
                setProfile({ ...profile, fitnessLevel: e.target.value as Profile["fitnessLevel"] })
              }
              className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
            >
              {FITNESS_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-pulse-muted">Weight Goal (kg)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={profile.weightGoalKg ?? ""}
              onChange={(e) =>
                setProfile({ ...profile, weightGoalKg: e.target.value ? Number(e.target.value) : null })
              }
              className="w-full rounded-xl border border-white/10 bg-pulse-surface-2 px-3 py-2.5 text-white outline-none focus:border-pulse-pink"
            />
          </div>
          <GlowButton type="submit" disabled={saving} className="mt-2 w-full">
            {saving ? "Saving…" : "Save Changes"}
          </GlowButton>
        </form>
      </NeonCard>
    </div>
  );
}
