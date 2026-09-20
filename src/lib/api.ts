import type {
  ConstructorStanding,
  DriverStanding,
  ErgastRace,
  ErgastResult,
  OpenF1Driver,
  SeasonSnapshot,
} from "../types";
import { portraitFor, TEAM_COLORS } from "./teams";

const JOLPICA = "https://api.jolpi.ca/ergast/f1";
const OPENF1 = "https://api.openf1.org/v1";

type MrData<T> = { MRData: T };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json() as Promise<T>;
}

async function paginateRaces(
  path: string,
  key: "Results" | "SprintResults" = "Results",
): Promise<ErgastRace[]> {
  const limit = 100;
  const first = await getJson<
    MrData<{ total: string; RaceTable: { Races: ErgastRace[] } }>
  >(`${JOLPICA}/${path}?limit=${limit}&offset=0`);
  const total = Number(first.MRData.total);
  const races = new Map<string, ErgastRace>();
  const merge = (list: ErgastRace[]) => {
    for (const race of list) {
      const id = `${race.season}-${race.round}`;
      const existing = races.get(id);
      if (!existing) {
        races.set(id, race);
        continue;
      }
      const incoming = race[key] ?? [];
      const prior = existing[key] ?? [];
      existing[key] = [...prior, ...incoming];
    }
  };
  merge(first.MRData.RaceTable.Races ?? []);
  const pages = Math.ceil(total / limit);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
      getJson<MrData<{ RaceTable: { Races: ErgastRace[] } }>>(
        `${JOLPICA}/${path}?limit=${limit}&offset=${(i + 1) * limit}`,
      ),
    ),
  );
  for (const page of rest) merge(page.MRData.RaceTable.Races ?? []);
  return [...races.values()].sort((a, b) => Number(a.round) - Number(b.round));
}

export async function fetchDriverCareerResults(driverId: string): Promise<ErgastRace[]> {
  return paginateRaces(`drivers/${driverId}/results.json`);
}

export async function fetchWorldTitles(driverId: string, seasons: string[]): Promise<number> {
  const unique = [...new Set(seasons)];
  const settled = await Promise.allSettled(
    unique.map((season) =>
      getJson<
        MrData<{
          StandingsTable: { StandingsLists: { DriverStandings: { position: string }[] }[] };
        }>
      >(`${JOLPICA}/${season}/drivers/${driverId}/driverstandings.json`),
    ),
  );
  return settled.reduce((count, result) => {
    if (result.status !== "fulfilled") return count;
    const pos = result.value.MRData.StandingsTable.StandingsLists[0]?.DriverStandings[0]?.position;
    return count + (pos === "1" ? 1 : 0);
  }, 0);
}

export async function fetchCircuitHistory(
  circuitId: string,
  seasons: string[],
): Promise<ErgastRace[]> {
  const settled = await Promise.allSettled(
    seasons.map((season) =>
      getJson<MrData<{ RaceTable: { Races: ErgastRace[] } }>>(
        `${JOLPICA}/${season}/circuits/${circuitId}/results.json?limit=100`,
      ),
    ),
  );
  return settled.flatMap((result) =>
    result.status === "fulfilled" ? (result.value.MRData.RaceTable.Races ?? []) : [],
  );
}

function mapPortraits(open: OpenF1Driver[], standings: DriverStanding[]) {
  const byCode = new Map(open.map((d) => [d.name_acronym, d]));
  const byNumber = new Map(open.map((d) => [String(d.driver_number), d]));
  const portraits: Record<string, string> = {};
  const teamColors: Record<string, string> = { ...TEAM_COLORS };
  for (const row of standings) {
    const code = row.Driver.code ?? "";
    const number = row.Driver.permanentNumber ?? "";
    const hit = byCode.get(code) ?? byNumber.get(number);
    portraits[row.Driver.driverId] = portraitFor(row.Driver.driverId, hit?.headshot_url);
    const constructorId = row.Constructors[0]?.constructorId;
    if (constructorId && hit?.team_colour) {
      teamColors[constructorId] = `#${hit.team_colour.replace(/^#/, "")}`;
    }
  }
  return { portraits, teamColors };
}

export async function loadSeason(): Promise<SeasonSnapshot> {
  const [calendar, drivers, constructors, open] = await Promise.all([
    getJson<MrData<{ RaceTable: { season: string; Races: ErgastRace[] } }>>(
      `${JOLPICA}/current.json?limit=40`,
    ),
    getJson<
      MrData<{
        StandingsTable: { season: string; StandingsLists: { round: string; DriverStandings: DriverStanding[] }[] };
      }>
    >(`${JOLPICA}/current/driverstandings.json`),
    getJson<
      MrData<{
        StandingsTable: { StandingsLists: { ConstructorStandings: ConstructorStanding[] }[] };
      }>
    >(`${JOLPICA}/current/constructorstandings.json`),
    getJson<OpenF1Driver[]>(`${OPENF1}/drivers?session_key=latest`).catch(() => [] as OpenF1Driver[]),
  ]);

  const season = calendar.MRData.RaceTable.season;
  const races = calendar.MRData.RaceTable.Races;
  const standingList = drivers.MRData.StandingsTable.StandingsLists[0];
  const driverStandings = standingList?.DriverStandings ?? [];
  const constructorStandings =
    constructors.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
  const currentRound = Number(standingList?.round ?? 0);

  const [seasonResults, sprintResults] = await Promise.all([
    paginateRaces(`${season}/results.json`),
    paginateRaces(`${season}/sprint.json`, "SprintResults").catch(() => [] as ErgastRace[]),
  ]);

  const resultsByRound = new Map<number, ErgastRace>();
  for (const race of seasonResults) resultsByRound.set(Number(race.round), race);
  const sprintByRound = new Map<number, ErgastRace>();
  for (const race of sprintResults) sprintByRound.set(Number(race.round), race);

  const { portraits, teamColors } = mapPortraits(open, driverStandings);

  return {
    season,
    currentRound,
    races,
    driverStandings,
    constructorStandings,
    resultsByRound,
    sprintByRound,
    portraits,
    teamColors,
  };
}

export function resultsForDriver(snapshot: SeasonSnapshot, driverId: string): ErgastResult[] {
  const rows: ErgastResult[] = [];
  for (const race of snapshot.resultsByRound.values()) {
    const hit = race.Results?.find((r) => r.Driver.driverId === driverId);
    if (hit) rows.push(hit);
  }
  return rows;
}

export function lastConstructor(
  snapshot: SeasonSnapshot,
  standing: DriverStanding,
): { id: string; name: string } {
  const rounds = [...snapshot.resultsByRound.keys()].sort((a, b) => b - a);
  for (const round of rounds) {
    const hit = snapshot.resultsByRound
      .get(round)
      ?.Results?.find((r) => r.Driver.driverId === standing.Driver.driverId);
    if (hit) return { id: hit.Constructor.constructorId, name: hit.Constructor.name };
  }
  const fallback = standing.Constructors[0];
  return { id: fallback?.constructorId ?? "unknown", name: fallback?.name ?? "Unknown" };
}
