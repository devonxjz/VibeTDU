"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLabStore } from "@/stores/lab-store";
import { AlertTriangle } from "lucide-react";

export function ExplanationPanel() {
  const lastReaction = useLabStore((state) => state.lastReaction);

  if (!lastReaction) return null;

  return (
    <div className="flex w-full flex-col">
      {lastReaction.safetyNoteVi && (
        <div className="mb-4 flex items-start gap-3 rounded-[var(--clay-rounded-lg)] border border-clay-brand-pink/35 bg-clay-brand-pink/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-clay-brand-pink" />
          <div>
            <div className="clay-caption-uppercase text-clay-brand-pink">An toàn</div>
            <p className="clay-body-sm text-clay-ink">
              {lastReaction.safetyNoteVi}
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-4 flex h-auto w-full rounded-[var(--clay-rounded-lg)] bg-clay-canvas p-1">
          <TabsTrigger
            value="basic"
            className="flex-1 rounded-[12px] clay-caption text-clay-muted data-[state=active]:bg-clay-primary data-[state=active]:text-clay-on-primary"
          >
            Cơ bản
          </TabsTrigger>
          <TabsTrigger
            value="intermediate"
            className="flex-1 rounded-[12px] clay-caption text-clay-muted data-[state=active]:bg-clay-primary data-[state=active]:text-clay-on-primary"
          >
            Trung cấp
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="flex-1 rounded-[12px] clay-caption text-clay-muted data-[state=active]:bg-clay-primary data-[state=active]:text-clay-on-primary"
          >
            Nâng cao
          </TabsTrigger>
        </TabsList>

        <div className="thin-scroll max-h-[28vh] min-h-[148px] overflow-y-auto rounded-[var(--clay-rounded-lg)] border border-clay-hairline bg-clay-canvas px-4 py-4">
          <TabsContent value="basic" className="mt-0">
            <p className="clay-body-md text-clay-body">
              {lastReaction.basicExplanation || lastReaction.explanationVi || "Không có giải thích cơ bản."}
            </p>
          </TabsContent>

          <TabsContent value="intermediate" className="mt-0">
            <p className="clay-body-md text-clay-body">
              {lastReaction.intermediateExplanation || "Không có giải thích trung cấp."}
            </p>
          </TabsContent>

          <TabsContent value="advanced" className="mt-0">
            <p className="clay-body-md text-clay-body">
              {lastReaction.advancedExplanation || "Không có giải thích nâng cao."}
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
