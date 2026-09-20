import { Link } from "react-router-dom";
import type { DriverStanding, PredictedOutcome } from "../types";
import { lastConstructor } from "../lib/api";
import { TEAM_SHORT, teamColor } from "../lib/teams";
import { placeLabel } from "../lib/format";
import { DriverPortrait } from "./DriverPortrait";
import { PredictedTag } from "./PredictedTag";
import { useSeason } from "../context/SeasonContext";

export function DriverCard({
  standing,
  prediction,
}: {
  standing: DriverStanding;
  prediction?: PredictedOutcome;
}) {
  const { snapshot } = useSeason();
  if (!snapshot) return null;
  const team = lastConstructor(snapshot, standing);
  const color = teamColor(team.id, snapshot.teamColors);
  const name = `${standing.Driver.givenName} ${standing.Driver.familyName}`;

  return (
    <Link
      to={`/drivers/${standing.Driver.driverId}`}
      className="group relative block overflow-hidden border border-line bg-carbon"
    >
      <DriverPortrait
        src={snapshot.portraits[standing.Driver.driverId]}
        name={name}
        color={color}
        className="aspect-[4/5] w-full"
      />
      <div className="absolute left-0 top-0 h-full w-[3px]" style={{ background: color }} />
      <p className="absolute right-4 top-3 font-display text-6xl leading-none text-paper/90">
        {standing.Driver.permanentNumber ?? "—"}
      </p>
      <div className="absolute inset-x-0 bottom-0 p-4 pt-16">
        <p className="text-[10px] uppercase tracking-[0.26em] text-paper/70">
          {TEAM_SHORT[team.id] ?? team.name}
        </p>
        <h3 className="font-serif text-[2rem] leading-none">{standing.Driver.familyName}</h3>
        <p className="mt-1 text-sm text-paper/70">{standing.Driver.givenName}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-paper/65">
          <span>
            P{standing.position} · {standing.points} pts
          </span>
          {prediction && (
            <span className="flex items-center gap-2 text-amber">
              <PredictedTag />
              {placeLabel(prediction.predictedPlace)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
