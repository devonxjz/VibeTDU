import { formatFormula } from "@/constants/chemicals";

interface FormulaProps {
  formula: string;
  className?: string;
}

export function Formula({ formula, className }: FormulaProps) {
  const parts = formatFormula(formula);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.sub ? (
          <sub key={i} className="text-[0.7em]">
            {p.text}
          </sub>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  );
}

interface ReactionFormulaProps {
  formula: string; // may contain → and +
  className?: string;
}

export function ReactionFormula({ formula, className }: ReactionFormulaProps) {
  // Split by spaces to keep operators clean
  const tokens = formula.split(/\s+/);
  return (
    <span className={className}>
      {tokens.map((tok, i) => {
        if (tok === "+" || tok === "→" || tok === "->") {
          return (
            <span key={i} className="mx-1 text-muted-foreground">
              {tok === "->" ? "→" : tok}
            </span>
          );
        }
        return <Formula key={i} formula={tok} />;
      })}
    </span>
  );
}
