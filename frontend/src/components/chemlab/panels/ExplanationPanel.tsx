import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLabStore } from "@/stores/lab-store";
import { AlertTriangle } from "lucide-react";

export function ExplanationPanel() {
  const lastReaction = useLabStore((s) => s.lastReaction);

  if (!lastReaction) return null;

  return (
    <div className="flex flex-col w-full">
      {lastReaction.safetyNoteVi && (
        <div className="mb-3 flex shrink-0 items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 shadow-sm dark:border-amber-400/30 dark:bg-amber-950/45">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <p className="text-xs font-bold leading-snug text-amber-950 dark:text-amber-100">
            Lưu ý: {lastReaction.safetyNoteVi}
          </p>
        </div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-3 flex h-9 w-full rounded-lg bg-control-bg p-1">
          <TabsTrigger value="basic" className="h-full flex-1 rounded-md text-xs font-bold">Cơ bản</TabsTrigger>
          <TabsTrigger value="intermediate" className="h-full flex-1 rounded-md text-xs font-bold">Trung cấp</TabsTrigger>
          <TabsTrigger value="advanced" className="h-full flex-1 rounded-md text-xs font-bold">Nâng cao</TabsTrigger>
        </TabsList>
        
        <div className="thin-scroll max-h-[28vh] min-h-[120px] overflow-y-auto rounded-lg bg-surface px-3 py-2.5 ring-1 ring-border/80">
          <TabsContent value="basic" className="mt-0 focus-visible:outline-none">
            <p className="text-sm leading-6 text-foreground">
              {lastReaction.basicExplanation || "Không có giải thích cơ bản."}
            </p>
          </TabsContent>
          
          <TabsContent value="intermediate" className="mt-0 focus-visible:outline-none">
            <p className="text-sm leading-6 text-foreground">
              {lastReaction.intermediateExplanation || "Không có giải thích trung cấp."}
            </p>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-0 focus-visible:outline-none">
            <p className="text-sm leading-6 text-foreground">
              {lastReaction.advancedExplanation || "Không có giải thích nâng cao."}
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
