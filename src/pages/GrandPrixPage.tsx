import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PlaceBand } from "../components/Figures";
import { PageHeader } from "../components/PageHeader";
import { PredictedTag } from "../components/PredictedTag";
import { SeasonGate } from "../components/SeasonGate";
import { fetchCircuitHistory } from "../lib/api";
import { formatWhen, placeLabel } from "../lib/format";
import { predictRace } from "../lib/predictions";
import { CIRCUIT_NOTES } from "../lib/teams";
import { useSeason } from "../context/SeasonContext";
import type { ErgastResult, PredictedOutcome } from "../types";

export function GrandPrixPage() {
  return (
    <SeasonGate>
      {() => <GrandPrixInner />}
    </SeasonGate>
  );
}

function GrandPrixInner() {
  const { round = "" } = useParams();
  const { snapshot, racePredictions } = useSeason();
  const [circuitPreds, setCircuitPreds] = useState<PredictedOutcome[] | null>(null);

  const race = snapshot?.races.find((row) => row.round === round);
  const completed = snapshot ? Number(round) <= snapshot.currentRound : false;
  const resultRace = snapshot?.resultsByRound.get(Number(round));

  useEffect(() => {
    if (!snapshot || !race || completed) return;
    let live = true;
    const years = [String(Number(snapshot.season) - 1), String(Number(snapshot.season) - 2)];
    fetchCircuitHistory(race.Circuit.circuitId, years).then((history) => {
      const byDriver = new Map<string, ErgastResult[]>();
      for (const past of history) {
        for (const row of past.Results ?? []) {
          const list = byDriver.get(row.Driver.driverId) ?? [];
          list.push(row);
          byDriver.set(row.Driver.driverId, list);
        }
      }
      if (live) setCircuitPreds(predictRace(snapshot, race.Circuit.circuitId, byDriver));
    });
    return () => {
      live = false;
    };
  }, [snapshot, race, completed]);

  const predictions = circuitPreds ?? racePredictions;
  const mapSrc = useMemo(() => {
    if (!race) return "";
    const lat = Number(race.Circuit.Location.lat);
    const lng = Number(race.Circuit.Location.long);
    const d = 0.18;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [race]);

  if (!snapshot || !race) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-24">
        <p className="font-serif text-4xl">That Grand Prix is not on this calendar.</p>
        <Link to="/grands-prix" className="mt-6 inline-block text-[11px] uppercase tracking-[0.22em] text-amber">
          Full calendar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        kicker={`Round ${race.round} · ${race.Circuit.Location.country}`}
        title={race.raceName.replace(" Grand Prix", "")}
        lede={CIRCUIT_NOTES[race.Circuit.circuitId]}
      />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-sm text-mute">{race.Circuit.circuitName}</p>
          <p className="mt-1 text-sm text-mute">
            {race.Circuit.Location.locality} · {formatWhen(race.date, race.time)}
          </p>
          {race.Sprint && (
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-amber">Sprint weekend</p>
          )}
          <div className="mt-8 overflow-hidden border border-line">
            <iframe title={race.Circuit.circuitName} src={mapSrc} className="h-64 w-full grayscale" />
          </div>
        </div>
        <div className="lg:col-span-7">
          {completed && resultRace?.Results ? (
            <>
              <p className="text-[11px] uppercase tracking-[0.24em] text-mute">Official classification</p>
              <ol className="mt-4">
                {resultRace.Results.map((row) => (
                  <li
                    key={row.Driver.driverId}
                    className="grid grid-cols-12 items-baseline gap-2 border-t border-line py-3"
                  >
                    <span className="col-span-2 font-display text-2xl">{placeLabel(Number(row.position))}</span>
                    <Link to={`/drivers/${row.Driver.driverId}`} className="col-span-6 font-serif text-xl">
                      {row.Driver.familyName}
                    </Link>
                    <span className="col-span-2 text-sm text-mute">{row.Constructor.name}</span>
                    <span className="col-span-2 text-right text-sm">{row.points} pts</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <PredictedTag />
                <p className="text-[11px] uppercase tracking-[0.24em] text-mute">Predicted finishing places</p>
              </div>
              <ol>
                {predictions.map((row) => {
                  const driver = snapshot.driverStandings.find((s) => s.Driver.driverId === row.driverId);
                  if (!driver) return null;
                  return (
                    <li key={row.driverId} className="border-t border-line py-4">
                      <div className="flex items-baseline justify-between gap-3">
                        <Link to={`/drivers/${row.driverId}`} className="font-serif text-2xl">
                          <span className="mr-3 font-display text-3xl text-mute">
                            {placeLabel(row.predictedPlace)}
                          </span>
                          {driver.Driver.familyName}
                        </Link>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-mute">
                          {placeLabel(row.placeRange[0])}–{placeLabel(row.placeRange[1])}
                        </span>
                      </div>
                      <div className="mt-3">
                        <PlaceBand place={row.predictedPlace} range={row.placeRange} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
