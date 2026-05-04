import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

export const clayPanelVariants = cva(
  "rounded-[var(--clay-rounded-xl)] border border-clay-hairline bg-clay-surface-soft text-clay-ink",
  {
    variants: {
      tone: {
        soft: "bg-clay-surface-soft",
        card: "bg-clay-surface-card",
        canvas: "bg-clay-canvas",
      },
    },
    defaultVariants: {
      tone: "soft",
    },
  },
);

export function ClayPanelShell({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof clayPanelVariants>) {
  return <div className={cn(clayPanelVariants({ tone }), className)} {...props} />;
}

export function ClaySectionCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--clay-rounded-lg)] border border-clay-hairline bg-clay-surface-card text-clay-ink",
        className,
      )}
      {...props}
    />
  );
}

export const clayButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--clay-rounded-md)] px-4 transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 clay-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-ink/20",
  {
    variants: {
      variant: {
        primary: "h-11 bg-clay-primary text-clay-on-primary hover:opacity-92",
        secondary:
          "h-11 border border-clay-hairline bg-clay-canvas text-clay-ink hover:bg-clay-surface-soft",
        ghost: "h-10 text-clay-muted hover:bg-clay-surface-card hover:text-clay-ink",
        onColor: "h-11 bg-white text-clay-ink hover:opacity-92",
      },
      size: {
        md: "px-4",
        lg: "px-5",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export function ClayActionButton({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof clayButtonVariants>) {
  return (
    <button
      className={cn(clayButtonVariants({ variant, size }), className)}
      type="button"
      {...props}
    />
  );
}

export const clayPillVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-1 clay-caption",
  {
    variants: {
      tone: {
        neutral: "bg-clay-canvas text-clay-muted border border-clay-hairline",
        dark: "bg-clay-ink text-clay-canvas",
        pink: "bg-clay-brand-pink text-clay-on-primary",
        teal: "bg-clay-brand-teal text-clay-on-primary",
        lavender: "bg-clay-brand-lavender text-clay-ink",
        peach: "bg-clay-brand-peach text-clay-ink",
        ochre: "bg-clay-brand-ochre text-clay-ink",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export function ClayPill({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof clayPillVariants>) {
  return <span className={cn(clayPillVariants({ tone }), className)} {...props} />;
}

export function ClayFieldShell({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[var(--clay-rounded-lg)] border border-clay-hairline bg-clay-canvas px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}
