import { useMemo, useState } from "react";
import { DriverCard } from "../components/DriverCard";
import { PageHeader } from "../components/PageHeader";
import { Reveal } from "../components/Reveal";
import { SeasonGate } from "../components/SeasonGate";
import { lastConstructor } from "../lib/api";
import { TEAM_SHORT } from "../lib/teams";
import { useSeason } from "../context/SeasonContext";

export function GridPage() {
  return (
    <SeasonGate>
      {() => <GridInner />}
    </SeasonGate>
  );
}

function GridInner() {
  const { snapshot, racePredictions } = useSeason();
  const [team, setTeam] = useState("all");
  if (!snapshot) return null;

  const teams = useMemo(() => {
    const ids = new Map<string, string>();
    for (const row of snapshot.driverStandings) {
      const current = lastConstructor(snapshot, row);
      ids.set(current.id, TEAM_SHORT[current.id] ?? current.name);
    }
    return [...ids.entries()];
  }, [snapshot]);

  const predById = new Map(racePredictions.map((row) => [row.driverId, row]));
  const rows = snapshot.driverStandings.filter((row) => {
    if (team === "all") return true;
    return lastConstructor(snapshot, row).id === team;
  });

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-16">
      <PageHeader
        kicker="Current grid"
        title="Twenty-three names, one championship."
        lede="Identity, number, team, and the model’s next-race place — assembled from the live 2026 standings."
      />
      <div className="mb-10 flex flex-wrap gap-2">
        <FilterChip active={team === "all"} onClick={() => setTeam("all")}>
          All
        </FilterChip>
        {teams.map(([id, name]) => (
          <FilterChip key={id} active={team === id} onClick={() => setTeam(id)}>
            {name}
          </FilterChip>
        ))}
      </div>
      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((standing) => (
            <DriverCard
              key={standing.Driver.driverId}
              standing={standing}
              prediction={predById.get(standing.Driver.driverId)}
            />
          ))}
        </div>
      </Reveal>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] ${
        active ? "border-paper bg-paper text-void" : "border-line text-mute hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}
