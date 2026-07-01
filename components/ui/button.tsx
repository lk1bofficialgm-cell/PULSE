import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
  {
    variants: {
      variant: {
        primary: "bg-white text-black hover:bg-neutral-200",
        secondary: "bg-surface-2 text-white border border-line hover:border-white/25",
        ghost: "bg-transparent text-muted hover:text-white",
        danger: "bg-transparent text-red-400 border border-red-500/25 hover:bg-red-500/10",
      },
      size: {
        sm: "px-3.5 py-1.5 text-[13px]",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
