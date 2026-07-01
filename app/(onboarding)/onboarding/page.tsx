"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const LEVELS = [
  { value: "BEGINNER", label: "Beginner", detail: "New to the gym or getting back into it" },
  { value: "INTERMEDIATE", label: "Intermediate", detail: "Training consistently for 6+ months" },
  { value: "ADVANCED", label: "Advanced", detail: "Years of training, ready to push hard" },
] as const;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SUGGESTED_DAYS: Record<string, number[]> = {
  BEGINNER: [1, 3, 5],
  INTERMEDIATE: [1, 2, 4, 5],
  ADVANCED: [1, 2, 3, 5, 6],
};

const BOTTLES = [
  { ml: 250, label: "Cup", detail: "250 ml" },
  { ml: 500, label: "Small bottle", detail: "500 ml" },
  { ml: 750, label: "Sport bottle", detail: "750 ml" },
  { ml: 1000, label: "Large bottle", detail: "1 L" },
  { ml: 1900, label: "Half gallon", detail: "1.9 L" },
  { ml: 3800, label: "Gallon jug", detail: "3.8 L" },
];

const GOALS = [
  { ml: 1500, label: "1.5 L" },
  { ml: 2000, label: "2 L" },
  { ml: 2500, label: "2.5 L" },
  { ml: 3000, label: "3 L" },
  { ml: 4000, label: "4 L" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<(typeof LEVELS)[number]["value"] | null>(null);
  const [days, setDays] = useState<number[]>([]);
  const [bottleMl, setBottleMl] = useState<number | null>(null);
  const [waterGoalMl, setWaterGoalMl] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickLevel(value: (typeof LEVELS)[number]["value"]) {
    setLevel(value);
    setDays(SUGGESTED_DAYS[value]);
    setTimeout(() => setStep(1), 250);
  }

  function toggleDay(day: number) {
    setDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day].sort()));
  }

  async function finish(goal: number) {
    setWaterGoalMl(goal);
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitnessLevel: level,
          trainingDays: days,
          bottleMl,
          waterGoalMl: goal,
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't save your plan — check your connection and try again.");
      setSubmitting(false);
    }
  }

  const steps = [
    // Step 0 — fitness level
    <div key="level" className="stagger flex flex-col gap-3">
      <StepTitle title="What's your level?" subtitle="This shapes your starting plan — you can change it anytime." />
      {LEVELS.map((l) => (
        <OptionCard key={l.value} active={level === l.value} onClick={() => pickLevel(l.value)}>
          <p className="font-bold text-white">{l.label}</p>
          <p className="text-sm text-muted">{l.detail}</p>
        </OptionCard>
      ))}
    </div>,

    // Step 1 — training days
    <div key="days" className="flex flex-col gap-5">
      <StepTitle
        title="Which days do you train?"
        subtitle={`Tap to toggle. ${days.length} day${days.length === 1 ? "" : "s"} a week selected.`}
      />
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((label, i) => {
          const on = days.includes(i);
          return (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-2xl border text-xs font-bold transition-all duration-200 active:scale-90",
                on ? "border-white bg-white text-black" : "border-line bg-surface text-muted"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <Button size="lg" disabled={days.length === 0} onClick={() => setStep(2)}>
        Continue
      </Button>
    </div>,

    // Step 2 — bottle
    <div key="bottle" className="stagger flex flex-col gap-3">
      <StepTitle title="What do you drink from?" subtitle="PULSE turns your daily water goal into bottles of yours." />
      <div className="grid grid-cols-2 gap-3">
        {BOTTLES.map((b) => (
          <OptionCard
            key={b.ml}
            active={bottleMl === b.ml}
            onClick={() => {
              setBottleMl(b.ml);
              setTimeout(() => setStep(3), 250);
            }}
          >
            <p className="font-bold text-white">{b.label}</p>
            <p className="text-sm text-muted">{b.detail}</p>
          </OptionCard>
        ))}
      </div>
    </div>,

    // Step 3 — daily goal
    <div key="goal" className="stagger flex flex-col gap-3">
      <StepTitle
        title="Daily water goal?"
        subtitle={
          bottleMl
            ? `We'll show it as ${Math.max(1, Math.ceil(2000 / bottleMl))}-ish bottles of yours — pick a target.`
            : "Pick a target."
        }
      />
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((g) => (
          <OptionCard key={g.ml} active={waterGoalMl === g.ml} onClick={() => finish(g.ml)}>
            <p className="font-bold text-white">{g.label}</p>
            <p className="text-sm text-muted">
              {bottleMl ? `≈ ${Math.max(1, Math.ceil(g.ml / bottleMl))} of your bottle` : ""}
            </p>
          </OptionCard>
        ))}
      </div>
      {submitting && <p className="text-center text-sm text-muted">Building your plan…</p>}
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>,
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <div className="mb-8 flex items-center gap-4">
        {step > 0 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="text-muted transition-colors hover:text-white"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <span className="w-[22px]" />
        )}
        <div className="flex flex-1 gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-white" : "bg-white/10"
              )}
            />
          ))}
        </div>
        <span className="w-[22px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <h1 className="text-2xl font-black text-white">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function OptionCard({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-3xl border p-4 text-left transition-all duration-200 active:scale-[0.97]",
        active ? "border-white bg-white/[0.06]" : "border-line bg-surface hover:border-white/25"
      )}
    >
      {active && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      {children}
    </button>
  );
}
