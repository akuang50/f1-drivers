export function PredictedTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center border border-amber/45 px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.26em] text-amber ${className}`}
    >
      Prediction
    </span>
  );
}
