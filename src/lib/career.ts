import type { CareerSeason, CareerSummary, ErgastRace } from "../types";

export function summarizeCareer(races: ErgastRace[], titles = 0): CareerSummary {
  const bySeason = new Map<string, CareerSeason>();
  let wins = 0;
  let podiums = 0;
  let poles = 0;
  let points = 0;
  let dnfs = 0;

  for (const race of races) {
    const result = race.Results?.[0];
    if (!result) continue;
    const pos = Number(result.position);
    const classified = result.positionText !== "R" && result.status !== "Retired";
    if (pos === 1) wins += 1;
    if (classified && pos <= 3) podiums += 1;
    if (Number(result.grid) === 1) poles += 1;
    points += Number(result.points);
    if (!classified) dnfs += 1;

    const current = bySeason.get(race.season) ?? {
      season: race.season,
      races: 0,
      wins: 0,
      podiums: 0,
      points: 0,
      bestFinish: 99,
      teams: [],
    };
    current.races += 1;
    if (pos === 1) current.wins += 1;
    if (classified && pos <= 3) current.podiums += 1;
    current.points += Number(result.points);
    current.bestFinish = Math.min(current.bestFinish, pos || 99);
    if (!current.teams.includes(result.Constructor.name)) {
      current.teams.push(result.Constructor.name);
    }
    bySeason.set(race.season, current);
  }

  const seasons = [...bySeason.values()].sort((a, b) => Number(a.season) - Number(b.season));

  return {
    seasons,
    races: races.length,
    wins,
    podiums,
    poles,
    points,
    dnfs,
    championships: titles,
  };
}
