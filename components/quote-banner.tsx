import { getTodaysQuote } from "@/lib/quotes";

export function QuoteBanner() {
  const quote = getTodaysQuote();
  return (
    <p className="px-1 text-sm italic leading-relaxed text-muted">&ldquo;{quote}&rdquo;</p>
  );
}
