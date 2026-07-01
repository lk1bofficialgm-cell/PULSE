"use client";

import { ExternalLink } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";

function toEmbedUrl(videoUrl: string): string | null {
  const match = videoUrl.match(/[?&]v=([\w-]{6,})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

export function DemoSheet({
  exercise,
  onClose,
}: {
  exercise: { name: string; videoUrl: string | null } | null;
  onClose: () => void;
}) {
  const embedUrl = exercise?.videoUrl ? toEmbedUrl(exercise.videoUrl) : null;
  const searchUrl = exercise
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} proper form`)}`
    : "#";

  return (
    <Sheet open={!!exercise} onClose={onClose} title={exercise?.name}>
      {embedUrl ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-black">
          <iframe
            src={embedUrl}
            title={`${exercise?.name} demo`}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 px-4 py-6 font-semibold text-white transition-colors hover:border-white/25"
        >
          Watch form videos on YouTube <ExternalLink size={16} />
        </a>
      )}
      <p className="mt-3 text-center text-[11px] text-faint">
        Focus on controlled reps — form beats weight, every time.
      </p>
    </Sheet>
  );
}
