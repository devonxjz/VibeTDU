import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLabStore } from "@/stores/lab-store";

export function ExplanationPanel() {
  const lastReaction = useLabStore((s) => s.lastReaction);

  if (!lastReaction) {
    return (
      <div className="mt-2 rounded-xl border border-dashed border-border p-3 text-center text-xs text-navy-soft">
        Chạy phản ứng để xem giải thích
      </div>
    );
  }

  return (
    <div className="mt-2">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic" className="text-[10px]">Cơ bản</TabsTrigger>
          <TabsTrigger value="intermediate" className="text-[10px]">Trung cấp</TabsTrigger>
          <TabsTrigger value="advanced" className="text-[10px]">Nâng cao</TabsTrigger>
        </TabsList>
        <div className="mt-2 rounded-xl border border-border bg-card p-3">
          <TabsContent value="basic" className="m-0 text-xs leading-relaxed text-navy-soft">
            {lastReaction.basicExplanation || "Không có giải thích cho cấp này"}
          </TabsContent>
          <TabsContent value="intermediate" className="m-0 text-xs leading-relaxed text-navy-soft">
            {lastReaction.intermediateExplanation || "Không có giải thích cho cấp này"}
          </TabsContent>
          <TabsContent value="advanced" className="m-0 text-xs leading-relaxed text-navy-soft">
            {lastReaction.advancedExplanation || "Không có giải thích cho cấp này"}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
