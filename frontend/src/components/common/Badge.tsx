import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "outline" | "accent";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700/60",
    primary: "bg-indigo-950/70 text-indigo-300 border-indigo-700/50",
    accent: "bg-cyan-950/70 text-cyan-300 border-cyan-700/50",
    success: "bg-emerald-950/70 text-emerald-300 border-emerald-700/50",
    warning: "bg-amber-950/70 text-amber-300 border-amber-700/50",
    outline: "bg-transparent text-slate-400 border-slate-700/80",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
