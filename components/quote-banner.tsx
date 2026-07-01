import { getTodaysQuote } from "@/lib/quotes";
import { NeonCard } from "@/components/ui/neon-card";

export function QuoteBanner() {
  const quote = getTodaysQuote();
  return (
    <NeonCard glow="pink" className="text-center">
      <p className="text-sm font-medium italic text-white">&ldquo;{quote}&rdquo;</p>
    </NeonCard>
  );
}
