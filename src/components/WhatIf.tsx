import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PredictedTag } from "./PredictedTag";
import { lastConstructor } from "../lib/api";
import { predictChampionship, remainingRaces } from "../lib/predictions";
import type { SeasonSnapshot } from "../types";

export function WhatIf({ snapshot }: { snapshot: SeasonSnapshot }) {
  const leftover = remainingRaces(snapshot);
  const max = Math.min(leftover.length, 6);
  const defaultId = snapshot.driverStandings[0]?.Driver.driverId ?? "";
  const [driverId, setDriverId] = useState(defaultId);
  const [count, setCount] = useState(Math.min(2, max));

  const forecast = useMemo(
    () =>
      predictChampionship(snapshot, {
        dnfNext: count > 0 ? { [driverId]: count } : {},
        sims: 700,
      }),
    [snapshot, driverId, count],
  );

  const driver = snapshot.driverStandings.find((row) => row.Driver.driverId === driverId);
  const title = forecast[0];
  const titleDriver = snapshot.driverStandings.find((row) => row.Driver.driverId === title?.driverId);
  const self = forecast.find((row) => row.driverId === driverId);

  return (
    <section className="border border-line p-8 md:p-12">
      <div className="mb-6 flex items-center gap-3">
        <PredictedTag />
        <p className="text-[11px] uppercase tracking-[0.24em] text-mute">What if</p>
      </div>
      <h2 className="font-serif text-4xl leading-none">Park someone for a weekend. Or two.</h2>
      <p className="mt-4 max-w-xl text-mute">
        The same championship simulation, with one car scored as a DNF for the next {count || "zero"} remaining
        round{count === 1 ? "" : "s"}. Not official — a form experiment.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-mute">The parked car</span>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="mt-2 w-full border border-line bg-void px-3 py-3 font-serif text-2xl outline-none focus:border-amber"
          >
            {snapshot.driverStandings.map((row) => (
              <option key={row.Driver.driverId} value={row.Driver.driverId}>
                {row.Driver.familyName} · {lastConstructor(snapshot, row).name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.22em] text-mute">
            DNFs the next {count} {count === 1 ? "race" : "races"}
          </span>
          <input
            type="range"
            min={0}
            max={max}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="mt-6 w-full accent-amber"
          />
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.16em] text-mute">
            <span>None</span>
            <span>{max}</span>
          </div>
        </label>
      </div>

      {title && titleDriver && self && driver && (
        <div className="mt-12 grid gap-8 border-t border-line pt-10 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-mute">Predicted champion</p>
            <Link to={`/drivers/${titleDriver.Driver.driverId}`} className="mt-2 block font-serif text-5xl leading-none">
              {titleDriver.Driver.familyName}
            </Link>
            <p className="mt-4 font-display text-6xl leading-none">{Math.round(title.titleOdds * 100)}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-mute">{driver.Driver.familyName} under this</p>
            <p className="mt-2 font-serif text-5xl leading-none">P{self.predictedPlace}</p>
            <p className="mt-4 text-sm text-mute">
              {Math.round(self.titleOdds * 100)}% title · {Math.round(self.predictedPoints)} pts projected
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
