import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { PredictedTag } from "../components/PredictedTag";
import { SeasonGate } from "../components/SeasonGate";
import { ShareActions } from "../components/ShareActions";
import { useSeason } from "../context/SeasonContext";
import { placeLabel } from "../lib/format";
import { nextRace } from "../lib/predictions";

export function ShareCardPage() {
  return (
    <SeasonGate>
      {() => <ShareInner />}
    </SeasonGate>
  );
}

function ShareInner() {
  const { round = "" } = useParams();
  const { snapshot, racePredictions } = useSeason();
  const race = snapshot?.races.find((row) => row.round === round);
  const upcoming = snapshot ? nextRace(snapshot) : undefined;
  const lines = useMemo(() => {
    if (!snapshot) return [];
    return racePredictions.slice(0, 10).map((row) => {
      const driver = snapshot.driverStandings.find((s) => s.Driver.driverId === row.driverId);
      return {
        place: row.predictedPlace,
        name: driver?.Driver.familyName ?? row.driverId,
        range: `${placeLabel(row.placeRange[0])}–${placeLabel(row.placeRange[1])}`,
      };
    });
  }, [racePredictions, snapshot]);

  if (!snapshot || !race) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-24">
        <p className="font-serif text-4xl">No such Grand Prix.</p>
      </div>
    );
  }

  const completed = Number(round) <= snapshot.currentRound;

  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
      <PredictedTag />
      <PageHeader
        kicker={`${race.Circuit.Location.locality} · Round ${race.round}`}
        title={race.raceName.replace(" Grand Prix", "")}
        lede={
          completed
            ? "A shareable predicted order from current form. For the official result, open the Grand Prix page."
            : "Shareable predicted order. Form model, not fortune-telling."
        }
      />
      <ol className="border-y border-line">
        {lines.map((line) => (
          <li key={line.place} className="flex items-baseline justify-between py-4">
            <span className="font-serif text-3xl">
              <span className="mr-4 font-display text-3xl text-mute">{placeLabel(line.place)}</span>
              {line.name}
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-amber">{line.range}</span>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <ShareActions
          raceName={race.raceName}
          locality={race.Circuit.Location.locality}
          round={race.round}
          lines={lines}
        />
      </div>
      <Link
        to={upcoming?.round === race.round ? "/predictions" : `/grands-prix/${race.round}`}
        className="mt-10 inline-block text-[11px] uppercase tracking-[0.22em] text-mute"
      >
        Back to the briefing →
      </Link>
    </div>
  );
}
