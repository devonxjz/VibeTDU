import React from "react";
import { FeatureCard } from "@/components/ui/feature-card";

export default function TestFeatureCardPage() {
  return (
    <div className="min-h-screen bg-clay-canvas p-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="clay-display-md mb-12 text-clay-ink">Feature Card Validation</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            color="pink"
            title="Pink Variant"
            description="Outbound / sequencer / growth. This card should have white text."
            ctaLabel="Get Started"
            ctaHref="#"
          />
          
          <FeatureCard
            color="teal"
            title="Teal Variant"
            description="Enterprise / featured / premium. This card should have white text."
            ctaLabel="Contact Sales"
          />
          
          <FeatureCard
            color="lavender"
            title="Lavender Variant"
            description="AI / automation / agents. This card should have dark ink text."
            ctaLabel="Learn More"
            ctaHref="#"
          />
          
          <FeatureCard
            color="peach"
            title="Peach Variant"
            description="General SaaS warmth / onboarding. This card should have dark ink text."
            ctaLabel="Read Docs"
          />
          
          <FeatureCard
            color="ochre"
            title="Ochre Variant"
            description="Community / experts / knowledge. This card should have dark ink text."
            ctaLabel="Join Community"
            ctaHref="#"
          />
          
          <FeatureCard
            color="cream"
            title="Cream Variant"
            description="Low emphasis / secondary. This card should have dark ink text."
            ctaLabel="View Features"
          />
        </div>
      </div>
    </div>
  );
}
