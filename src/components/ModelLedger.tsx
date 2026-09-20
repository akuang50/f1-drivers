import { Link } from "react-router-dom";
import { PredictedTag } from "./PredictedTag";
import { placeLabel } from "../lib/format";
import type { Ledger } from "../lib/ledger";
import type { SeasonSnapshot } from "../types";

export function ModelLedger({
  ledger,
  snapshot,
  compact = false,
}: {
  ledger: Ledger;
  snapshot: SeasonSnapshot;
  compact?: boolean;
}) {
  const last = ledger.rounds.at(-1);
  if (!ledger.rounds.length) return null;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <PredictedTag />
          <h2 className="mt-3 font-serif text-4xl">Be wrong in public.</h2>
          <p className="mt-3 max-w-xl text-mute">
            After each completed race we freeze the model as it stood on Saturday night, then score it against Sunday.
            Average miss this season: <span className="text-paper">{ledger.mae.toFixed(1)} places</span>. Exact hits{" "}
            {Math.round(ledger.exact * 100)}%. Within three: {Math.round(ledger.withinThree * 100)}%.
          </p>
        </div>
        {compact && last && (
          <Link to="/predictions" className="text-[11px] uppercase tracking-[0.22em] text-amber">
            Full ledger →
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Score value={ledger.mae.toFixed(1)} label="Mean miss (places)" />
        <Score value={`${Math.round(ledger.withinThree * 100)}%`} label="Within three" />
        <Score value={`${Math.round(ledger.exact * 100)}%`} label="Exact place" />
      </div>
      {!compact && (
        <ol className="mt-12">
          {ledger.rounds
            .slice()
            .reverse()
            .map((round) => (
              <li key={round.round} className="border-t border-line py-8">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <Link to={`/grands-prix/${round.round}`} className="font-serif text-3xl">
                    {round.raceName.replace(" Grand Prix", "")}
                  </Link>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-mute">
                    Round {round.round} · miss {round.mae.toFixed(1)}
                  </p>
                </div>
                <ol className="mt-4">
                  {round.rows.slice(0, 8).map((row) => {
                    const driver = snapshot.driverStandings.find((s) => s.Driver.driverId === row.driverId);
                    const abs = Math.abs(row.delta);
                    return (
                      <li
                        key={row.driverId}
                        className="grid grid-cols-12 items-baseline gap-2 py-1.5 text-sm"
                      >
                        <span className="col-span-4 font-serif text-lg">
                          {driver?.Driver.familyName ?? row.driverId}
                        </span>
                        <span className="col-span-3 text-mute">
                          predicted {placeLabel(row.predicted)}
                        </span>
                        <span className="col-span-3">actual {placeLabel(row.actual)}</span>
                        <span className={`col-span-2 text-right ${abs === 0 ? "text-amber" : "text-mute"}`}>
                          {row.delta === 0 ? "spot on" : row.delta > 0 ? `+${row.delta}` : row.delta}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
        </ol>
      )}
    </section>
  );
}

function Score({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="font-display text-5xl leading-none">{value}</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-mute">{label}</p>
    </div>
  );
}
