import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PredictedTag } from "../components/PredictedTag";
import { DriverPortrait } from "../components/DriverPortrait";
import { Reveal } from "../components/Reveal";
import { SeasonGate } from "../components/SeasonGate";
import { lastConstructor } from "../lib/api";
import { countdownParts, formatDate, placeLabel, raceTarget } from "../lib/format";
import { lastRace, nextRace } from "../lib/predictions";
import { TEAM_SHORT, teamColor } from "../lib/teams";
import { ModelLedger } from "../components/ModelLedger";
import { useSeason } from "../context/SeasonContext";

export function HomePage() {
  return <SeasonGate>{() => <HomeInner />}</SeasonGate>;
}

function HomeInner() {
  const { snapshot, racePredictions, championship, ledger } = useSeason();
  if (!snapshot) return null;

  const leader = snapshot.driverStandings[0];
  const team = lastConstructor(snapshot, leader);
  const color = teamColor(team.id, snapshot.teamColors);
  const upcoming = nextRace(snapshot);
  const previous = lastRace(snapshot);
  const title = championship[0];
  const podium = racePredictions.slice(0, 3);
  const target = upcoming ? raceTarget(upcoming.date, upcoming.time) : new Date();
  const [clock, setClock] = useState(() => countdownParts(target));

  useEffect(() => {
    const id = window.setInterval(() => setClock(countdownParts(target)), 30_000);
    return () => window.clearInterval(id);
  }, [target]);

  const leaderName = `${leader.Driver.givenName} ${leader.Driver.familyName}`;
  const issue = useMemo(
    () => `Vol. ${snapshot.season}  ·  Round ${snapshot.currentRound}`,
    [snapshot],
  );

  return (
    <div>
      <section className="mx-auto grid min-h-[calc(100svh-72px)] max-w-[1200px] lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <DriverPortrait
            src={snapshot.portraits[leader.Driver.driverId]}
            name={leaderName}
            color={color}
            className="h-[52vh] w-full lg:h-full"
          />
          <p className="absolute left-6 top-8 font-display text-[9rem] leading-none text-paper/15">
            {leader.Driver.permanentNumber}
          </p>
        </div>
        <div className="flex flex-col justify-center px-6 py-14 lg:col-span-7 lg:px-14">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.34em] text-amber">{issue}</p>
            <p className="mt-6 font-serif italic text-mute">The championship is being written in the present tense.</p>
            <h1 className="mt-3 font-serif text-[clamp(4rem,10vw,8.4rem)] leading-[0.86]">
              {leader.Driver.familyName}
            </h1>
            <p className="mt-4 text-lg text-mute">
              {leader.Driver.givenName} · {TEAM_SHORT[team.id] ?? team.name} · {leader.points} pts · {leader.wins} wins
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={`/drivers/${leader.Driver.driverId}`}
                className="border border-paper/30 px-5 py-3 text-[11px] uppercase tracking-[0.22em] hover:border-paper"
              >
                Open profile
              </Link>
              <Link
                to="/predictions"
                className="text-[11px] uppercase tracking-[0.22em] text-amber"
              >
                Read the model →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {upcoming && (
        <section className="border-y border-line">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-mute">Next Grand Prix</p>
              <h2 className="mt-3 font-serif text-5xl leading-none">{upcoming.raceName.replace(" Grand Prix", "")}</h2>
              <p className="mt-4 text-mute">
                {upcoming.Circuit.circuitName}
                <br />
                {upcoming.Circuit.Location.locality}, {upcoming.Circuit.Location.country}
              </p>
              <p className="mt-6 font-display text-6xl leading-none">
                {clock.past ? "Lights out" : `${clock.days}d ${String(clock.hours).padStart(2, "0")}h`}
              </p>
              <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-mute">{formatDate(upcoming.date)}</p>
              <Link
                to={`/grands-prix/${upcoming.round}`}
                className="mt-6 inline-block text-[11px] uppercase tracking-[0.22em] text-paper"
              >
                Circuit briefing →
              </Link>
            </div>
            <div className="md:col-span-7">
              <div className="mb-5 flex items-center gap-3">
                <PredictedTag />
                <p className="text-[11px] uppercase tracking-[0.24em] text-mute">Likely finishing places</p>
              </div>
              <ol className="space-y-0">
                {podium.map((row, idx) => {
                  const driver = snapshot.driverStandings.find((s) => s.Driver.driverId === row.driverId);
                  if (!driver) return null;
                  return (
                    <li key={row.driverId} className="flex items-end justify-between border-t border-line py-5">
                      <div>
                        <p className="font-display text-5xl leading-none text-paper/90">{placeLabel(idx + 1)}</p>
                        <Link to={`/drivers/${row.driverId}`} className="font-serif text-3xl">
                          {driver.Driver.familyName}
                        </Link>
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-mute">
                        {Math.round(row.winChance * 100)}% win · {Math.round(row.podiumChance * 100)}% podium
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-mute">After {previous?.raceName ?? "the last round"}</p>
            <h2 className="mt-2 font-serif text-4xl">The title picture</h2>
          </div>
          <Link to="/championship" className="text-[11px] uppercase tracking-[0.22em] text-amber">
            Full standings →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {snapshot.driverStandings.slice(0, 3).map((row) => {
            const forecast = championship.find((c) => c.driverId === row.Driver.driverId);
            const t = lastConstructor(snapshot, row);
            return (
              <Link
                key={row.Driver.driverId}
                to={`/drivers/${row.Driver.driverId}`}
                className="border border-line p-6"
              >
                <p className="font-display text-5xl leading-none">P{row.position}</p>
                <h3 className="mt-2 font-serif text-3xl">{row.Driver.familyName}</h3>
                <p className="text-sm text-mute">{TEAM_SHORT[t.id] ?? t.name}</p>
                <p className="mt-6 font-display text-4xl">{row.points}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-mute">points</p>
                {forecast && (
                  <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-amber">
                    Predicted title {Math.round(forecast.titleOdds * 100)}%
                  </p>
                )}
              </Link>
            );
          })}
        </div>
        {title && (
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-mute">
            The model has {snapshot.driverStandings.find((d) => d.Driver.driverId === title.driverId)?.Driver.familyName} as
            championship favourite after {snapshot.currentRound} rounds, with {remainingCopy(title.remainingMax)} still on the table.
          </p>
        )}
      </section>

      {ledger && (
        <section className="mx-auto max-w-[1200px] px-6 pb-16">
          <ModelLedger ledger={ledger} snapshot={snapshot} compact />
        </section>
      )}
    </div>
  );
}

function remainingCopy(max: number) {
  return `${max} points`;
}
