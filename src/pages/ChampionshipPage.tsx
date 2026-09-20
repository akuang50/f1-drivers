import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { PredictedTag } from "../components/PredictedTag";
import { SeasonGate } from "../components/SeasonGate";
import { lastConstructor } from "../lib/api";
import { remainingRaces } from "../lib/predictions";
import { TEAM_SHORT } from "../lib/teams";
import { useSeason } from "../context/SeasonContext";

export function ChampionshipPage() {
  return (
    <SeasonGate>
      {() => <ChampionshipInner />}
    </SeasonGate>
  );
}

function ChampionshipInner() {
  const { snapshot, championship } = useSeason();
  if (!snapshot) return null;
  const leftover = remainingRaces(snapshot).length;
  const favourite = championship[0];
  const second = championship[1];
  const favDriver = snapshot.driverStandings.find((row) => row.Driver.driverId === favourite?.driverId);
  const secondDriver = snapshot.driverStandings.find((row) => row.Driver.driverId === second?.driverId);

  const constructors = new Map<string, { name: string; points: number; predicted: number }>();
  for (const standing of snapshot.driverStandings) {
    const team = lastConstructor(snapshot, standing);
    const forecast = championship.find((row) => row.driverId === standing.Driver.driverId);
    const current = constructors.get(team.id) ?? { name: TEAM_SHORT[team.id] ?? team.name, points: 0, predicted: 0 };
    current.points += Number(standing.points);
    current.predicted += forecast?.predictedPoints ?? Number(standing.points);
    constructors.set(team.id, current);
  }
  const wcc = [...constructors.values()].sort((a, b) => b.predicted - a.predicted);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        kicker="World championship"
        title="The remaining arithmetic of glory."
        lede={`${leftover} Grands Prix left. Forecasts below are simulated from current form and team pace — not official FIA projections.`}
      />

      {favourite && favDriver && second && secondDriver && (
        <section className="mb-16 border border-line p-8 md:p-12">
          <div className="mb-6 flex items-center gap-3">
            <PredictedTag />
            <p className="text-[11px] uppercase tracking-[0.24em] text-mute">Title fight</p>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            <Duel
              name={favDriver.Driver.familyName}
              id={favDriver.Driver.driverId}
              odds={favourite.titleOdds}
              points={favourite.predictedPoints}
              label="Favourite"
            />
            <Duel
              name={secondDriver.Driver.familyName}
              id={secondDriver.Driver.driverId}
              odds={second.titleOdds}
              points={second.predictedPoints}
              label="Chaser"
            />
          </div>
          <div className="mt-10 h-3 overflow-hidden bg-paper/10">
            <div className="h-full bg-amber" style={{ width: `${Math.round(favourite.titleOdds * 100)}%` }} />
          </div>
        </section>
      )}

      <h2 className="font-serif text-3xl">Drivers — current vs predicted</h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.2em] text-mute">
            <tr className="border-b border-line">
              <th className="py-3 font-normal">Now</th>
              <th className="font-normal">Driver</th>
              <th className="font-normal">Pts</th>
              <th className="font-normal">Predicted P</th>
              <th className="font-normal">Predicted pts</th>
              <th className="font-normal">Title</th>
            </tr>
          </thead>
          <tbody>
            {championship.map((row) => {
              const driver = snapshot.driverStandings.find((s) => s.Driver.driverId === row.driverId);
              if (!driver) return null;
              const delta = row.currentPlace - row.predictedPlace;
              return (
                <tr key={row.driverId} className="border-b border-line">
                  <td className="py-3 font-display text-2xl">P{row.currentPlace}</td>
                  <td>
                    <Link to={`/drivers/${row.driverId}`} className="font-serif text-xl">
                      {driver.Driver.familyName}
                    </Link>
                  </td>
                  <td>{row.currentPoints}</td>
                  <td className="text-amber">
                    P{row.predictedPlace}
                    {delta !== 0 && (
                      <span className="ml-2 text-mute">
                        {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}
                      </span>
                    )}
                  </td>
                  <td>{Math.round(row.predictedPoints)}</td>
                  <td>{Math.round(row.titleOdds * 100)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-16 font-serif text-3xl">Constructors — predicted finish</h2>
      <ol className="mt-6">
        {wcc.map((row, idx) => (
          <li key={row.name} className="flex items-baseline justify-between border-t border-line py-4">
            <span>
              <span className="mr-4 font-display text-3xl text-mute">P{idx + 1}</span>
              <span className="font-serif text-2xl">{row.name}</span>
            </span>
            <span className="text-sm text-mute">
              {row.points} now → {Math.round(row.predicted)} predicted
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Duel({
  name,
  id,
  odds,
  points,
  label,
}: {
  name: string;
  id: string;
  odds: number;
  points: number;
  label: string;
}) {
  return (
    <Link to={`/drivers/${id}`}>
      <p className="text-[10px] uppercase tracking-[0.24em] text-mute">{label}</p>
      <h3 className="mt-2 font-serif text-5xl leading-none">{name}</h3>
      <p className="mt-4 font-display text-6xl leading-none">{Math.round(odds * 100)}%</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-mute">
        title odds · {Math.round(points)} pts projected
      </p>
    </Link>
  );
}
