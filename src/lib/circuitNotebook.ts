import { classifiedPosition } from "./predictions";
import type { ErgastRace } from "../types";

export type TrackVisit = {
  season: string;
  round: string;
  position: number;
  classified: boolean;
  status: string;
};

export type TrackNote = {
  driverId: string;
  visits: TrackVisit[];
  avgFinish: number;
  dnfRate: number;
  best: number;
};

export function notebookForCircuit(history: ErgastRace[], gridIds: Set<string>): TrackNote[] {
  const byDriver = new Map<string, TrackVisit[]>();
  const sorted = [...history].sort(
    (a, b) => Number(b.season) - Number(a.season) || Number(b.round) - Number(a.round),
  );

  for (const race of sorted) {
    for (const res of race.Results ?? []) {
      if (!gridIds.has(res.Driver.driverId)) continue;
      const list = byDriver.get(res.Driver.driverId) ?? [];
      list.push({
        season: race.season,
        round: race.round,
        position: classifiedPosition(res),
        classified: res.positionText !== "R" && res.status !== "Retired",
        status: res.status,
      });
      byDriver.set(res.Driver.driverId, list);
    }
  }

  return [...byDriver.entries()]
    .map(([driverId, visits]) => {
      const avgFinish = visits.reduce((sum, visit) => sum + visit.position, 0) / visits.length;
      const dnfs = visits.filter((visit) => !visit.classified).length;
      const best = Math.min(...visits.map((visit) => visit.position));
      return {
        driverId,
        visits,
        avgFinish,
        dnfRate: dnfs / visits.length,
        best,
      };
    })
    .sort((a, b) => a.avgFinish - b.avgFinish);
}
