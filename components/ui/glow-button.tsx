import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

const glowButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-pulse-pink to-pulse-purple text-white shadow-glow-pink hover:brightness-110",
        secondary:
          "bg-pulse-surface-2 text-white border border-white/10 hover:border-pulse-pink/50",
        ghost: "bg-transparent text-pulse-muted hover:text-white",
        danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface GlowButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glowButtonVariants> {}

export function GlowButton({ className, variant, size, ...props }: GlowButtonProps) {
  return <button className={cn(glowButtonVariants({ variant, size }), className)} {...props} />;
}
