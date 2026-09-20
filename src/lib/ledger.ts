import { classifiedPosition, predictRace, snapshotAsOf } from "./predictions";
import type { SeasonSnapshot } from "../types";

export type PlaceVerdict = {
  driverId: string;
  predicted: number;
  actual: number;
  delta: number;
};

export type RoundVerdict = {
  round: number;
  raceName: string;
  circuitId: string;
  rows: PlaceVerdict[];
  mae: number;
};

export type Ledger = {
  rounds: RoundVerdict[];
  mae: number;
  withinThree: number;
  exact: number;
};

export function modelLedger(snapshot: SeasonSnapshot): Ledger {
  const rounds: RoundVerdict[] = [];

  for (let round = 1; round <= snapshot.currentRound; round += 1) {
    const actual = snapshot.resultsByRound.get(round);
    if (!actual?.Results?.length) continue;
    const prior = snapshotAsOf(snapshot, round - 1);
    const preds = predictRace(prior, actual.Circuit.circuitId, undefined, 240);
    const predMap = new Map(preds.map((row) => [row.driverId, row.predictedPlace]));
    const rows = actual.Results.map((res) => {
      const actualPlace = classifiedPosition(res);
      const predicted = predMap.get(res.Driver.driverId) ?? 20;
      return {
        driverId: res.Driver.driverId,
        predicted,
        actual: actualPlace,
        delta: predicted - actualPlace,
      };
    });
    const mae = rows.reduce((sum, row) => sum + Math.abs(row.delta), 0) / rows.length;
    rounds.push({
      round,
      raceName: actual.raceName,
      circuitId: actual.Circuit.circuitId,
      rows,
      mae,
    });
  }

  const all = rounds.flatMap((round) => round.rows);
  const mae = all.length ? all.reduce((sum, row) => sum + Math.abs(row.delta), 0) / all.length : 0;
  const withinThree = all.length ? all.filter((row) => Math.abs(row.delta) <= 3).length / all.length : 0;
  const exact = all.length ? all.filter((row) => row.delta === 0).length / all.length : 0;
  return { rounds, mae, withinThree, exact };
}
