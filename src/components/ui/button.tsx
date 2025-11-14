import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@/components/ui/slot";

const baseStyles =
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background cursor-pointer text-foreground";

const variants = {
  default:
    "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_20px_40px_-15px_var(--shadow-primary)] hover:brightness-110 text-white",
  outline:
    "border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] hover:bg-[color:var(--glass-surface-strong)] hover:text-foreground backdrop-blur text-foreground",
  ghost: "hover:bg-muted/60 hover:text-foreground",
  secondary:
    "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] shadow-[0_20px_40px_-20px_var(--shadow-secondary)] hover:brightness-105 text-foreground",
} as const;

const sizes: Record<string, string> = {
  default: "h-11 px-6",
  sm: "h-9 rounded-full px-4 text-xs",
  lg: "h-12 rounded-full px-8 text-base",
  icon: "h-11 w-11",
};

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
};

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  const variantStyles = variants[variant] ?? variants.default;
  const sizeStyles = sizes[size] ?? sizes.default;
  return (
    <Component
      className={cn(baseStyles, variantStyles, sizeStyles, className)}
      {...props}
    />
  );
}
