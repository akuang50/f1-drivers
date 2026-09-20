import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DriverPortrait } from "../components/DriverPortrait";
import { FormPulse, PlaceBand, StatFigure } from "../components/Figures";
import { PredictedTag } from "../components/PredictedTag";
import { SeasonGate } from "../components/SeasonGate";
import { fetchDriverCareerResults, fetchWorldTitles, lastConstructor } from "../lib/api";
import { summarizeCareer } from "../lib/career";
import { ageFrom, formatDate, placeLabel } from "../lib/format";
import { teammateSplit } from "../lib/teammate";
import { nextRace, remainingRaces, seasonStatsFor } from "../lib/predictions";
import { TEAM_SHORT, teamColor } from "../lib/teams";
import { useSeason } from "../context/SeasonContext";
import type { CareerSummary } from "../types";

export function DriverPage() {
  return (
    <SeasonGate>
      {() => <DriverInner />}
    </SeasonGate>
  );
}

function DriverInner() {
  const { id = "" } = useParams();
  const { snapshot, racePredictions, championship } = useSeason();
  const [career, setCareer] = useState<CareerSummary | null>(null);

  useEffect(() => {
    let live = true;
    fetchDriverCareerResults(id)
      .then(async (races) => {
        const seasons = [...new Set(races.map((race) => race.season))];
        const titles = await fetchWorldTitles(id, seasons);
        if (live) setCareer(summarizeCareer(races, titles));
      })
      .catch(() => {
        if (live) setCareer(summarizeCareer([], 0));
      });
    return () => {
      live = false;
    };
  }, [id]);

  if (!snapshot) return null;
  const standing = snapshot.driverStandings.find((row) => row.Driver.driverId === id);
  if (!standing) {
    return (
      <div className="mx-auto max-w-[800px] px-6 py-24">
        <p className="font-serif text-4xl">This driver is not on the 2026 grid.</p>
        <Link to="/grid" className="mt-6 inline-block text-[11px] uppercase tracking-[0.22em] text-amber">
          Back to the grid
        </Link>
      </div>
    );
  }

  const team = lastConstructor(snapshot, standing);
  const color = teamColor(team.id, snapshot.teamColors);
  const stats = seasonStatsFor(snapshot, id);
  const prediction = racePredictions.find((row) => row.driverId === id);
  const forecast = championship.find((row) => row.driverId === id);
  const upcoming = nextRace(snapshot);
  const leftover = remainingRaces(snapshot).length;
  const name = `${standing.Driver.givenName} ${standing.Driver.familyName}`;
  const split = teammateSplit(snapshot, id);

  return (
    <div>
      <section className="mx-auto grid max-w-[1200px] lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <DriverPortrait
            src={snapshot.portraits[id]}
            name={name}
            color={color}
            className="h-[60vh] w-full lg:h-full min-h-[520px]"
          />
          <p className="absolute bottom-6 left-6 font-display text-[10rem] leading-none text-paper/20">
            {standing.Driver.permanentNumber}
          </p>
        </div>
        <div className="flex flex-col justify-end px-6 py-14 lg:col-span-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-amber">
            {TEAM_SHORT[team.id] ?? team.name} · No. {standing.Driver.permanentNumber}
          </p>
          <h1 className="mt-3 font-serif text-[clamp(3.4rem,8vw,6.5rem)] leading-[0.88]">
            {standing.Driver.familyName}
          </h1>
          <p className="mt-3 text-xl text-mute">{standing.Driver.givenName}</p>
          <dl className="mt-10 grid grid-cols-2 gap-6 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-mute">Nationality</dt>
              <dd className="mt-1">{standing.Driver.nationality}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-mute">Age</dt>
              <dd className="mt-1">{ageFrom(standing.Driver.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-mute">Born</dt>
              <dd className="mt-1">{formatDate(standing.Driver.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.22em] text-mute">Championship</dt>
              <dd className="mt-1">
                P{standing.position} · {standing.points} pts
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-mute">{snapshot.season} form</p>
        <h2 className="mt-2 font-serif text-4xl">The numbers, cinematic.</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <StatFigure value={stats.wins} label="Wins" />
          <StatFigure value={stats.podiums} label="Podiums" />
          <StatFigure value={stats.avgFinish.toFixed(1)} label="Avg finish" />
          <StatFigure value={stats.poles} label="Poles" />
          <StatFigure value={stats.dnfs} label="DNFs" />
        </div>
        <div className="mt-14">
          <p className="mb-4 text-[11px] uppercase tracking-[0.24em] text-mute">Recent finishing pulse</p>
          <FormPulse form={stats.form} />
        </div>
      </section>

      {split && (
        <section className="border-y border-line">
          <div className="mx-auto max-w-[1200px] px-6 py-16">
            <p className="text-[11px] uppercase tracking-[0.3em] text-mute">The other car</p>
            <h2 className="mt-2 font-serif text-4xl">
              Versus{" "}
              <Link to={`/drivers/${split.teammate.Driver.driverId}`} className="italic">
                {split.teammate.Driver.familyName}
              </Link>
            </h2>
            <p className="mt-3 text-mute">
              {split.weekends} shared weekends at {split.teamName} this season.
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <SplitStat
                label="Qualifying"
                mine={`${split.qualiWon}–${split.qualiLost}`}
                detail={`avg grid ${split.avgGrid.toFixed(1)} vs ${split.teammateAvgGrid.toFixed(1)}`}
              />
              <SplitStat
                label="Race"
                mine={`${split.raceWon}–${split.raceLost}`}
                detail={`avg finish ${split.avgFinish.toFixed(1)} vs ${split.teammateAvgFinish.toFixed(1)}`}
              />
              <SplitStat
                label="Points"
                mine={`${split.points}–${split.teammatePoints}`}
                detail="championship tally, same team"
              />
            </div>
          </div>
        </section>
      )}

      {prediction && upcoming && (
        <section className="border-y border-line">
          <div className="mx-auto max-w-[1200px] px-6 py-16">
            <div className="mb-6 flex items-center gap-3">
              <PredictedTag />
              <p className="text-[11px] uppercase tracking-[0.24em] text-mute">
                What they will do next · {upcoming.raceName}
              </p>
            </div>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="font-display text-8xl leading-none">{placeLabel(prediction.predictedPlace)}</p>
                <p className="mt-2 text-mute">
                  Likely range {placeLabel(prediction.placeRange[0])}–{placeLabel(prediction.placeRange[1])}
                </p>
                <div className="mt-6">
                  <PlaceBand place={prediction.predictedPlace} range={prediction.placeRange} />
                </div>
                <p className="mt-8 max-w-md text-lg leading-relaxed">{prediction.nextMove}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-amber">Form: {prediction.formLabel}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-3 lg:col-span-7">
                <Chance label="Win" value={prediction.winChance} />
                <Chance label="Podium" value={prediction.podiumChance} />
                <Chance label="Points" value={prediction.pointsChance} />
              </div>
            </div>
            {forecast && (
              <p className="mt-12 max-w-2xl text-sm leading-relaxed text-mute">
                Championship outlook: predicted P{forecast.predictedPlace} on {Math.round(forecast.predictedPoints)} points
                after {leftover} remaining rounds
                {forecast.titleOdds > 0.02
                  ? ` — title probability ${Math.round(forecast.titleOdds * 100)}%.`
                  : "."}{" "}
                This is a simulation, not an official forecast.
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1200px] px-6 py-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-mute">Career</p>
        <h2 className="mt-2 font-serif text-4xl">A life in seasons.</h2>
        {!career ? (
          <p className="mt-8 text-mute">Loading archive…</p>
        ) : (
          <>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              <StatFigure value={career.races} label="Starts" />
              <StatFigure value={career.wins} label="Career wins" />
              <StatFigure value={career.podiums} label="Podiums" />
              <StatFigure value={career.poles} label="Poles" />
              <StatFigure value={career.championships || "—"} label="World titles" />
            </div>
            <ol className="mt-12 divide-y divide-line border-y border-line">
              {career.seasons
                .slice()
                .reverse()
                .map((season) => (
                  <li key={season.season} className="grid grid-cols-12 items-baseline gap-3 py-4 text-sm">
                    <span className="col-span-2 font-display text-2xl">{season.season}</span>
                    <span className="col-span-4 text-mute">{season.teams.join(" / ")}</span>
                    <span className="col-span-2">{season.races} starts</span>
                    <span className="col-span-2">{season.wins} wins</span>
                    <span className="col-span-2 text-right">{Math.round(season.points)} pts</span>
                  </li>
                ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}

function Chance({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line p-6">
      <p className="font-display text-6xl leading-none">{Math.round(value * 100)}</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-mute">{label} %</p>
      <div className="mt-6 h-px bg-paper/10">
        <div className="h-px bg-amber" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}

function SplitStat({ label, mine, detail }: { label: string; mine: string; detail: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-mute">{label}</p>
      <p className="mt-2 font-display text-5xl leading-none">{mine}</p>
      <p className="mt-2 text-sm text-mute">{detail}</p>
    </div>
  );
}
