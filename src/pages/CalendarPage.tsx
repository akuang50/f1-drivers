import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { SeasonGate } from "../components/SeasonGate";
import { formatDate } from "../lib/format";
import { CIRCUIT_NOTES } from "../lib/teams";
import { useSeason } from "../context/SeasonContext";

export function CalendarPage() {
  return (
    <SeasonGate>
      {() => <CalendarInner />}
    </SeasonGate>
  );
}

function CalendarInner() {
  const { snapshot } = useSeason();
  if (!snapshot) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        kicker="2026 World Championship"
        title="Places. Circuits. The year in lights."
        lede="Every Grand Prix on the calendar — completed rounds with results, remaining rounds with predicted finishing places."
      />
      <ol>
        {snapshot.races.map((race) => {
          const round = Number(race.round);
          const done = round <= snapshot.currentRound;
          return (
            <li key={race.round}>
              <Link
                to={`/grands-prix/${race.round}`}
                className="grid grid-cols-12 items-baseline gap-4 border-t border-line py-6 hover:text-amber"
              >
                <span className="col-span-2 font-display text-4xl leading-none">
                  {String(round).padStart(2, "0")}
                </span>
                <span className="col-span-6">
                  <span className="block font-serif text-3xl leading-none">
                    {race.raceName.replace(" Grand Prix", "")}
                  </span>
                  <span className="mt-2 block text-sm text-mute">
                    {race.Circuit.Location.locality} · {race.Circuit.circuitName}
                  </span>
                </span>
                <span className="col-span-2 text-sm text-mute">{formatDate(race.date)}</span>
                <span className="col-span-2 text-right text-[10px] uppercase tracking-[0.2em] text-amber">
                  {done ? "Result" : "Predicted grid"}
                </span>
              </Link>
              {CIRCUIT_NOTES[race.Circuit.circuitId] && (
                <p className="-mt-2 mb-4 ml-[16.6%] max-w-xl text-sm italic text-mute">
                  {CIRCUIT_NOTES[race.Circuit.circuitId]}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
