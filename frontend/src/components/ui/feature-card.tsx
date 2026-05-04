import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

export type FeatureCardColor =
  | "pink"
  | "teal"
  | "lavender"
  | "peach"
  | "ochre"
  | "cream";

export interface FeatureCardProps {
  color: FeatureCardColor;
  title: string;
  description: string;
  media?: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export const featureCardVariants = cva(
  "flex flex-col gap-4 p-6 md:p-8 rounded-[24px]",
  {
    variants: {
      color: {
        pink: "bg-clay-brand-pink text-clay-on-primary",
        teal: "bg-clay-brand-teal text-clay-on-primary",
        lavender: "bg-clay-brand-lavender text-clay-ink",
        peach: "bg-clay-brand-peach text-clay-ink",
        ochre: "bg-clay-brand-ochre text-clay-ink",
        cream: "bg-clay-surface-card text-clay-ink",
      },
    },
  }
);

function getCtaVariant(color: FeatureCardColor): "on-color" | "primary" {
  return color === "pink" || color === "teal" ? "on-color" : "primary";
}

const ctaVariantClasses = {
  "on-color": "bg-white text-clay-ink",
  primary: "bg-clay-primary text-clay-on-primary",
};

const ctaBaseClasses =
  "inline-flex items-center justify-center h-[44px] rounded-[12px] px-5 clay-button transition-opacity hover:opacity-90";

export const FeatureCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & FeatureCardProps>(
  (
    { color, title, description, media, ctaLabel, ctaHref, className, ...props },
    ref
  ) => {
    return (
      <div ref={ref} className={cn(featureCardVariants({ color }), className)} {...props}>
        <h3 className="clay-title-md">{title}</h3>
        <p className="clay-body-md">{description}</p>
        {media && <div className="mt-auto">{media}</div>}
        
        {ctaLabel && (
          <div className="mt-4">
            {ctaHref ? (
              <a
                href={ctaHref}
                className={cn(ctaBaseClasses, ctaVariantClasses[getCtaVariant(color)])}
              >
                {ctaLabel}
              </a>
            ) : (
              <button
                type="button"
                className={cn(ctaBaseClasses, ctaVariantClasses[getCtaVariant(color)])}
              >
                {ctaLabel}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";
