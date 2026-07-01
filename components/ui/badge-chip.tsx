export function BadgeChip({
  icon,
  name,
  description,
}: {
  icon: string;
  name: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface-2 px-3 py-3 text-center">
      <span className="text-2xl grayscale">{icon}</span>
      <span className="text-xs font-semibold text-white">{name}</span>
      {description && <span className="text-[10px] leading-tight text-muted">{description}</span>}
    </div>
  );
}
