import type { FormEntry } from "../types";

export function FormPulse({ form }: { form: FormEntry[] }) {
  const slice = form.slice(-8);
  if (!slice.length) return <p className="text-mute">No race starts yet.</p>;

  return (
    <div className="flex h-36 items-end gap-2">
      {slice.map((entry) => {
        const height = Math.max(8, ((21 - entry.position) / 20) * 100);
        return (
          <div key={entry.round} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-24 w-full items-end bg-paper/6">
              <div
                className={`w-full ${entry.classified ? "bg-paper/80" : "bg-ember/70"}`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="font-display text-xl leading-none">
              {entry.classified ? entry.position : "R"}
            </span>
            <span className="text-[9px] uppercase tracking-[0.16em] text-mute">{entry.raceName}</span>
          </div>
        );
      })}
    </div>
  );
}

export function PlaceBand({ place, range }: { place: number; range: [number, number] }) {
  const left = ((range[0] - 1) / 20) * 100;
  const width = ((range[1] - range[0] + 1) / 20) * 100;
  const mark = ((place - 1) / 20) * 100;
  return (
    <div className="relative h-2 bg-paper/10">
      <div
        className="absolute inset-y-0 bg-amber/45"
        style={{ left: `${left}%`, width: `${Math.max(width, 3)}%` }}
      />
      <div
        className="absolute top-1/2 h-3.5 w-px -translate-y-1/2 bg-paper"
        style={{ left: `${mark}%` }}
      />
    </div>
  );
}

export function StatFigure({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="font-display text-[3.4rem] leading-none">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-mute">{label}</p>
    </div>
  );
}
