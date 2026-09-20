import { lastConstructor } from "./api";
import { classifiedPosition } from "./predictions";
import type { DriverStanding, SeasonSnapshot } from "../types";

export type TeammateSplit = {
  teammate: DriverStanding;
  teamName: string;
  weekends: number;
  qualiWon: number;
  qualiLost: number;
  raceWon: number;
  raceLost: number;
  points: number;
  teammatePoints: number;
  avgGrid: number;
  teammateAvgGrid: number;
  avgFinish: number;
  teammateAvgFinish: number;
};

export function teammateOf(snapshot: SeasonSnapshot, driverId: string): DriverStanding | undefined {
  const self = snapshot.driverStandings.find((row) => row.Driver.driverId === driverId);
  if (!self) return undefined;
  const team = lastConstructor(snapshot, self);
  return snapshot.driverStandings.find((row) => {
    if (row.Driver.driverId === driverId) return false;
    return lastConstructor(snapshot, row).id === team.id;
  });
}

export function teammateSplit(snapshot: SeasonSnapshot, driverId: string): TeammateSplit | null {
  const self = snapshot.driverStandings.find((row) => row.Driver.driverId === driverId);
  const other = teammateOf(snapshot, driverId);
  if (!self || !other) return null;
  const team = lastConstructor(snapshot, self);

  let weekends = 0;
  let qualiWon = 0;
  let qualiLost = 0;
  let raceWon = 0;
  let raceLost = 0;
  let gridSum = 0;
  let otherGrid = 0;
  let finishSum = 0;
  let otherFinish = 0;

  const rounds = [...snapshot.resultsByRound.keys()].sort((a, b) => a - b);
  for (const round of rounds) {
    const results = snapshot.resultsByRound.get(round)?.Results;
    if (!results) continue;
    const mine = results.find((row) => row.Driver.driverId === driverId);
    const theirs = results.find((row) => row.Driver.driverId === other.Driver.driverId);
    if (!mine || !theirs) continue;
    weekends += 1;
    const myGrid = Number(mine.grid) || 20;
    const theirGrid = Number(theirs.grid) || 20;
    gridSum += myGrid;
    otherGrid += theirGrid;
    if (myGrid < theirGrid) qualiWon += 1;
    else if (myGrid > theirGrid) qualiLost += 1;
    const myRace = classifiedPosition(mine);
    const theirRace = classifiedPosition(theirs);
    finishSum += myRace;
    otherFinish += theirRace;
    if (myRace < theirRace) raceWon += 1;
    else if (myRace > theirRace) raceLost += 1;
  }

  return {
    teammate: other,
    teamName: team.name,
    weekends,
    qualiWon,
    qualiLost,
    raceWon,
    raceLost,
    points: Number(self.points),
    teammatePoints: Number(other.points),
    avgGrid: weekends ? gridSum / weekends : 0,
    teammateAvgGrid: weekends ? otherGrid / weekends : 0,
    avgFinish: weekends ? finishSum / weekends : 0,
    teammateAvgFinish: weekends ? otherFinish / weekends : 0,
  };
}
