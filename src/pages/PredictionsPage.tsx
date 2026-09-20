import { Link } from "react-router-dom";
import { PlaceBand } from "../components/Figures";
import { PageHeader } from "../components/PageHeader";
import { PredictedTag } from "../components/PredictedTag";
import { SeasonGate } from "../components/SeasonGate";
import { placeLabel } from "../lib/format";
import { ModelLedger } from "../components/ModelLedger";
import { nextRace, remainingRaces } from "../lib/predictions";
import { useSeason } from "../context/SeasonContext";

export function PredictionsPage() {
  return (
    <SeasonGate>
      {() => <PredictionsInner />}
    </SeasonGate>
  );
}

function PredictionsInner() {
  const { snapshot, racePredictions, championship, ledger } = useSeason();
  if (!snapshot) return null;
  const upcoming = nextRace(snapshot);
  const leftover = remainingRaces(snapshot);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        kicker="The model"
        title="Form, not fortune-telling."
        lede="Every forecast here is labeled as a prediction. It blends last-five-race finishing positions, season average, constructor strength, and a seeded simulation of the remaining calendar. It is not official."
      />

      <section className="mb-16 border border-line p-8">
        <p className="text-[11px] uppercase tracking-[0.24em] text-mute">How it thinks</p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed">
          Recent pace is weighted heaviest. Team standing supplies the floor. Street circuits get more chaos in the
          simulation. Remaining sprints add a small points overlay. Refresh after a race and the picture moves.
        </p>
        <p className="mt-4 text-sm text-mute">
          {leftover.length} Grands Prix remain in {snapshot.season}. Data: Jolpica / OpenF1.
        </p>
      </section>

      {upcoming && (
        <section className="mb-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <PredictedTag />
                <p className="text-[11px] uppercase tracking-[0.24em] text-mute">{upcoming.raceName}</p>
              </div>
              <h2 className="font-serif text-4xl">Predicted finishing places</h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link
                to={`/grands-prix/${upcoming.round}`}
                className="text-[11px] uppercase tracking-[0.22em] text-amber"
              >
                Circuit page →
              </Link>
              <Link
                to={`/grands-prix/${upcoming.round}/card`}
                className="text-[11px] uppercase tracking-[0.22em] text-mute"
              >
                Share card
              </Link>
            </div>
          </div>
          <ol>
            {racePredictions.map((row) => {
              const driver = snapshot.driverStandings.find((s) => s.Driver.driverId === row.driverId);
              if (!driver) return null;
              return (
                <li key={row.driverId} className="border-t border-line py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <Link to={`/drivers/${row.driverId}`} className="font-serif text-2xl md:text-3xl">
                      <span className="mr-3 font-display text-3xl text-mute">
                        {placeLabel(row.predictedPlace)}
                      </span>
                      {driver.Driver.familyName}
                    </Link>
                    <span className="text-[11px] uppercase tracking-[0.16em] text-mute">
                      {placeLabel(row.placeRange[0])}–{placeLabel(row.placeRange[1])} · {row.formLabel}
                    </span>
                  </div>
                  <div className="mt-3">
                    <PlaceBand place={row.predictedPlace} range={row.placeRange} />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section>
        <div className="mb-6 flex items-center gap-3">
          <PredictedTag />
          <h2 className="font-serif text-4xl">Championship probabilities</h2>
        </div>
        <ol>
          {championship
            .filter((row) => row.titleOdds >= 0.005)
            .map((row) => {
              const driver = snapshot.driverStandings.find((s) => s.Driver.driverId === row.driverId);
              if (!driver) return null;
              return (
                <li key={row.driverId} className="border-t border-line py-5">
                  <div className="flex items-baseline justify-between">
                    <Link to={`/drivers/${row.driverId}`} className="font-serif text-2xl">
                      {driver.Driver.familyName}
                    </Link>
                    <span className="font-display text-4xl">{Math.round(row.titleOdds * 100)}%</span>
                  </div>
                  <div className="mt-3 h-1.5 bg-paper/10">
                    <div className="h-full bg-amber" style={{ width: `${Math.round(row.titleOdds * 100)}%` }} />
                  </div>
                </li>
              );
            })}
        </ol>
      </section>

      {ledger && (
        <section className="mt-20">
          <ModelLedger ledger={ledger} snapshot={snapshot} />
        </section>
      )}
    </div>
  );
}
