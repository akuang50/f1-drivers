import { lastConstructor } from "./api";
import { STREET_CIRCUITS } from "./teams";
import type {
  ChampionshipForecast,
  DriverSeasonStats,
  DriverStanding,
  ErgastRace,
  ErgastResult,
  FormEntry,
  PredictedOutcome,
  SeasonSnapshot,
} from "../types";

const RACE_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const SPRINT_POINTS = [8, 7, 6, 5, 4, 3, 2, 1];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-9);
  const v = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function classifiedPosition(result: ErgastResult) {
  const n = Number(result.position);
  if (!Number.isFinite(n) || n <= 0) return 20;
  return n;
}

export function snapshotAsOf(snapshot: SeasonSnapshot, lastCompletedRound: number): SeasonSnapshot {
  const resultsByRound = new Map(
    [...snapshot.resultsByRound.entries()].filter(([round]) => round <= lastCompletedRound),
  );
  const sprintByRound = new Map(
    [...snapshot.sprintByRound.entries()].filter(([round]) => round <= lastCompletedRound),
  );

  const ctorPts = new Map<string, { pts: number; wins: number; ctor: (typeof snapshot.constructorStandings)[0]["Constructor"] }>();
  const add = (
    constructor: (typeof snapshot.constructorStandings)[0]["Constructor"],
    points: number,
    win: boolean,
  ) => {
    const cur = ctorPts.get(constructor.constructorId) ?? { pts: 0, wins: 0, ctor: constructor };
    cur.pts += points;
    if (win) cur.wins += 1;
    ctorPts.set(constructor.constructorId, cur);
  };
  for (const race of resultsByRound.values()) {
    for (const res of race.Results ?? []) add(res.Constructor, Number(res.points), res.position === "1");
  }
  for (const race of sprintByRound.values()) {
    for (const res of race.SprintResults ?? []) add(res.Constructor, Number(res.points), false);
  }

  const constructorStandings = [...ctorPts.values()]
    .sort((a, b) => b.pts - a.pts)
    .map((row, i) => ({
      position: String(i + 1),
      positionText: String(i + 1),
      points: String(row.pts),
      wins: String(row.wins),
      Constructor: row.ctor,
    }));

  return {
    ...snapshot,
    currentRound: Math.max(0, lastCompletedRound),
    resultsByRound,
    sprintByRound,
    constructorStandings: constructorStandings.length ? constructorStandings : snapshot.constructorStandings,
  };
}

export function seasonStatsFor(snapshot: SeasonSnapshot, driverId: string): DriverSeasonStats {
  const form: FormEntry[] = [];
  let wins = 0;
  let podiums = 0;
  let pointsFinishes = 0;
  let dnfs = 0;
  let poles = 0;
  let finishSum = 0;
  let gridSum = 0;
  let bestFinish = 99;
  let points = 0;
  let races = 0;

  const rounds = [...snapshot.resultsByRound.keys()].sort((a, b) => a - b);
  for (const round of rounds) {
    const race = snapshot.resultsByRound.get(round);
    const result = race?.Results?.find((row) => row.Driver.driverId === driverId);
    if (!result || !race) continue;
    races += 1;
    const pos = classifiedPosition(result);
    const classified = result.positionText !== "R" && result.status !== "Retired";
    if (!classified) dnfs += 1;
    if (pos === 1) wins += 1;
    if (pos <= 3 && classified) podiums += 1;
    if (Number(result.points) > 0) pointsFinishes += 1;
    if (Number(result.grid) === 1) poles += 1;
    finishSum += pos;
    gridSum += Number(result.grid) || pos;
    points += Number(result.points);
    bestFinish = Math.min(bestFinish, pos);
    form.push({
      round,
      raceName: race.raceName.replace(" Grand Prix", ""),
      circuitId: race.Circuit.circuitId,
      position: pos,
      classified,
      points: Number(result.points),
      status: result.status,
    });
  }

  return {
    driverId,
    races,
    wins,
    podiums,
    pointsFinishes,
    dnfs,
    poles,
    avgFinish: races ? finishSum / races : 16,
    avgGrid: races ? gridSum / races : 16,
    points,
    bestFinish: bestFinish === 99 ? 20 : bestFinish,
    form,
  };
}

function teamRank(snapshot: SeasonSnapshot, constructorId: string) {
  const row = snapshot.constructorStandings.find(
    (standing) => standing.Constructor.constructorId === constructorId,
  );
  return Number(row?.position ?? 8);
}

function formWindow(form: FormEntry[], n: number) {
  const slice = form.slice(-n);
  if (!slice.length) return 14;
  return slice.reduce((sum, entry) => sum + entry.position, 0) / slice.length;
}

export function expectedScore(
  snapshot: SeasonSnapshot,
  standing: DriverStanding,
  circuitHistory?: ErgastResult[],
) {
  const stats = seasonStatsFor(snapshot, standing.Driver.driverId);
  const team = lastConstructor(snapshot, standing);
  const recent = formWindow(stats.form, 5);
  const prior = formWindow(stats.form.slice(0, -5), 5);
  const teamComponent = teamRank(snapshot, team.id) * 1.7;
  let circuit = recent;
  if (circuitHistory?.length) {
    circuit =
      circuitHistory.reduce((sum, row) => sum + classifiedPosition(row), 0) /
      circuitHistory.length;
  }
  const score = recent * 0.46 + stats.avgFinish * 0.24 + teamComponent * 0.2 + circuit * 0.1;
  return { score, recent, prior, stats, team };
}

function formLabel(recent: number, prior: number): PredictedOutcome["formLabel"] {
  const delta = prior - recent;
  if (delta >= 1.4) return "surging";
  if (delta <= -1.4) return "fading";
  return "steady";
}

function narrative(place: number, label: PredictedOutcome["formLabel"], name: string) {
  if (place === 1) {
    return `${name} is projected to fight for the win — the model has them as the favourite.`;
  }
  if (place <= 3) {
    return label === "surging"
      ? `${name} is on an upswing and is predicted to convert that form into a podium.`
      : `${name} is predicted to leave with a trophy — a likely podium finish.`;
  }
  if (place <= 10) {
    return `${name} is predicted to score: a points-paying finish around ${place === 10 ? "the edge of the top ten" : `P${place}`}.`;
  }
  return `${name} is predicted to run outside the points, unless the race turns chaotic.`;
}

export function predictRace(
  snapshot: SeasonSnapshot,
  circuitId?: string,
  historyByDriver?: Map<string, ErgastResult[]>,
  sims = 900,
): PredictedOutcome[] {
  const scored = snapshot.driverStandings.map((standing) => {
    const history = circuitId ? historyByDriver?.get(standing.Driver.driverId) : undefined;
    const { score, recent, prior, stats } = expectedScore(snapshot, standing, history);
    return { standing, score, recent, prior, stats };
  });
  scored.sort((a, b) => a.score - b.score);

  const seed = Number(snapshot.season) * 1000 + snapshot.currentRound * 17 + (circuitId?.length ?? 0);
  const rand = mulberry32(seed);
  const placeHits = new Map<string, number[]>();
  for (const row of scored) placeHits.set(row.standing.Driver.driverId, []);

  const volatility = circuitId && STREET_CIRCUITS.has(circuitId) ? 2.8 : 1.9;
  for (let i = 0; i < sims; i += 1) {
    const noisy = scored.map((row) => ({
      id: row.standing.Driver.driverId,
      v: row.score + gaussian(rand) * volatility,
    }));
    noisy.sort((a, b) => a.v - b.v);
    noisy.forEach((row, idx) => placeHits.get(row.id)?.push(idx + 1));
  }

  return scored.map((row, idx) => {
    const places = placeHits.get(row.standing.Driver.driverId) ?? [idx + 1];
    const podiumChance = places.filter((p) => p <= 3).length / places.length;
    const pointsChance = places.filter((p) => p <= 10).length / places.length;
    const winChance = places.filter((p) => p === 1).length / places.length;
    const sorted = [...places].sort((a, b) => a - b);
    const lo = sorted[Math.floor(sorted.length * 0.15)] ?? idx + 1;
    const hi = sorted[Math.floor(sorted.length * 0.85)] ?? idx + 1;
    const label = formLabel(row.recent, row.prior || row.recent);
    const name = row.standing.Driver.familyName;
    return {
      driverId: row.standing.Driver.driverId,
      predictedPlace: idx + 1,
      expectedScore: row.score,
      placeRange: [lo, hi] as [number, number],
      podiumChance,
      pointsChance,
      winChance,
      formLabel: label,
      nextMove: narrative(idx + 1, label, name),
    };
  });
}

function pointsForPlace(table: number[], place: number) {
  return table[place - 1] ?? 0;
}

export function remainingRaces(snapshot: SeasonSnapshot) {
  return snapshot.races.filter((race) => Number(race.round) > snapshot.currentRound);
}

export function remainingMaxPoints(snapshot: SeasonSnapshot) {
  const leftover = remainingRaces(snapshot);
  const racePts = leftover.length * 25;
  const sprintPts = leftover.filter((race) => Boolean(race.Sprint)).length * 8;
  return racePts + sprintPts;
}

export type WhatIfConfig = {
  dnfNext?: Record<string, number>;
  sims?: number;
};

export function predictChampionship(
  snapshot: SeasonSnapshot,
  whatIf: WhatIfConfig = {},
): ChampionshipForecast[] {
  const leftover = remainingRaces(snapshot);
  const remainingMax = remainingMaxPoints(snapshot);
  const base = predictRace(snapshot);
  const byId = new Map(base.map((row) => [row.driverId, row]));
  const seed = Number(snapshot.season) * 333 + snapshot.currentRound * 91;
  const rand = mulberry32(seed);
  const sims = whatIf.sims ?? 1200;
  const dnfNext = whatIf.dnfNext ?? {};
  const titles = new Map<string, number>();
  const pointSums = new Map<string, number>();
  const placeSums = new Map<string, number>();

  for (const standing of snapshot.driverStandings) {
    titles.set(standing.Driver.driverId, 0);
    pointSums.set(standing.Driver.driverId, 0);
    placeSums.set(standing.Driver.driverId, 0);
  }

  for (let i = 0; i < sims; i += 1) {
    const totals = new Map(
      snapshot.driverStandings.map((standing) => [
        standing.Driver.driverId,
        Number(standing.points),
      ]),
    );
    leftover.forEach((race, raceIndex) => {
      const street = STREET_CIRCUITS.has(race.Circuit.circuitId);
      const parked = new Set(
        snapshot.driverStandings
          .map((standing) => standing.Driver.driverId)
          .filter((id) => (dnfNext[id] ?? 0) > raceIndex),
      );
      const noisy = snapshot.driverStandings
        .filter((standing) => !parked.has(standing.Driver.driverId))
        .map((standing) => {
          const pred = byId.get(standing.Driver.driverId);
          return {
            id: standing.Driver.driverId,
            v: (pred?.expectedScore ?? 12) + gaussian(rand) * (street ? 2.6 : 1.8),
          };
        });
      noisy.sort((a, b) => a.v - b.v);
      noisy.forEach((row, idx) => {
        totals.set(row.id, (totals.get(row.id) ?? 0) + pointsForPlace(RACE_POINTS, idx + 1));
      });
      if (race.Sprint) {
        const sprintNoise = noisy.map((row) => ({
          id: row.id,
          v: row.v + gaussian(rand) * 1.2,
        }));
        sprintNoise.sort((a, b) => a.v - b.v);
        sprintNoise.forEach((row, idx) => {
          totals.set(row.id, (totals.get(row.id) ?? 0) + pointsForPlace(SPRINT_POINTS, idx + 1));
        });
      }
    });
    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    titles.set(ranked[0][0], (titles.get(ranked[0][0]) ?? 0) + 1);
    ranked.forEach(([id, pts], idx) => {
      pointSums.set(id, (pointSums.get(id) ?? 0) + pts);
      placeSums.set(id, (placeSums.get(id) ?? 0) + (idx + 1));
    });
  }

  const rows = snapshot.driverStandings.map((standing) => {
    const id = standing.Driver.driverId;
    return {
      driverId: id,
      currentPoints: Number(standing.points),
      predictedPoints: (pointSums.get(id) ?? 0) / sims,
      predictedPlace: (placeSums.get(id) ?? 0) / sims,
      currentPlace: Number(standing.position),
      titleOdds: (titles.get(id) ?? 0) / sims,
      remainingMax,
    };
  });
  rows.sort((a, b) => b.predictedPoints - a.predictedPoints);
  return rows.map((row, idx) => ({ ...row, predictedPlace: idx + 1 }));
}

export function nextRace(snapshot: SeasonSnapshot): ErgastRace | undefined {
  return snapshot.races.find((race) => Number(race.round) > snapshot.currentRound) ?? snapshot.races.at(-1);
}

export function lastRace(snapshot: SeasonSnapshot): ErgastRace | undefined {
  return snapshot.resultsByRound.get(snapshot.currentRound);
}
