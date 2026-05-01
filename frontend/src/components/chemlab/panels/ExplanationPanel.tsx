import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLabStore } from "@/stores/lab-store";
import { AlertTriangle, Info } from "lucide-react";

export function ExplanationPanel() {
  const lastReaction = useLabStore((s) => s.lastReaction);

  if (!lastReaction) return null;

  return (
    <div className="flex flex-col w-full">
      {/* Safety Note - Tighter */}
      {lastReaction.safetyNoteVi && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-2 py-1.5 mb-2 shrink-0">
          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          <p className="text-[10px] font-bold text-amber-700 leading-tight">
            Lưu ý: {lastReaction.safetyNoteVi}
          </p>
        </div>
      )}

      {/* Tabs - Very Compact */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="flex w-full h-7 bg-muted/50 p-0.5 rounded-lg mb-2">
          <TabsTrigger value="basic" className="flex-1 text-[10px] h-full py-0">Cơ bản</TabsTrigger>
          <TabsTrigger value="intermediate" className="flex-1 text-[10px] h-full py-0">Trung cấp</TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1 text-[10px] h-full py-0">Nâng cao</TabsTrigger>
        </TabsList>
        
        <div className="min-h-[100px] overflow-y-auto px-1">
          <TabsContent value="basic" className="mt-0 focus-visible:outline-none">
            <p className="text-[11px] leading-relaxed text-navy-soft">
              {lastReaction.basicExplanation || "Không có giải thích cơ bản."}
            </p>
          </TabsContent>
          
          <TabsContent value="intermediate" className="mt-0 focus-visible:outline-none">
            <p className="text-[11px] leading-relaxed text-navy-soft">
              {lastReaction.intermediateExplanation || "Không có giải thích trung cấp."}
            </p>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-0 focus-visible:outline-none">
            <p className="text-[11px] leading-relaxed text-navy-soft">
              {lastReaction.advancedExplanation || "Không có giải thích nâng cao."}
            </p>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
