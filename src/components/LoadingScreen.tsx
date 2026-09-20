import { useSeason } from "../context/SeasonContext";

export function LoadingScreen({ label = "Setting the grid" }: { label?: string }) {
  const { loading, error } = useSeason();
  if (error) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 text-center">
        <div>
          <p className="font-serif text-4xl italic">Timing screens are dark</p>
          <p className="mt-3 text-mute">{error}</p>
        </div>
      </div>
    );
  }
  if (!loading) return null;
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <p className="font-display text-7xl text-paper/20">00</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.34em] text-mute">{label}</p>
      </div>
    </div>
  );
}
