export type ErgastDriver = {
  driverId: string;
  permanentNumber?: string;
  code?: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
};

export type ErgastConstructor = {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
};

export type ErgastLocation = {
  lat: string;
  long: string;
  locality: string;
  country: string;
};

export type ErgastCircuit = {
  circuitId: string;
  url: string;
  circuitName: string;
  Location: ErgastLocation;
};

export type SessionStamp = {
  date: string;
  time?: string;
};

export type ErgastRace = {
  season: string;
  round: string;
  url: string;
  raceName: string;
  Circuit: ErgastCircuit;
  date: string;
  time?: string;
  FirstPractice?: SessionStamp;
  SecondPractice?: SessionStamp;
  ThirdPractice?: SessionStamp;
  Qualifying?: SessionStamp;
  Sprint?: SessionStamp;
  SprintQualifying?: SessionStamp;
  Results?: ErgastResult[];
  SprintResults?: ErgastResult[];
};

export type ErgastResult = {
  number: string;
  position: string;
  positionText: string;
  points: string;
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
  grid: string;
  laps: string;
  status: string;
  Time?: { millis?: string; time: string };
  FastestLap?: {
    rank?: string;
    lap?: string;
    Time?: { time: string };
  };
};

export type DriverStanding = {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: ErgastDriver;
  Constructors: ErgastConstructor[];
};

export type ConstructorStanding = {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: ErgastConstructor;
};

export type OpenF1Driver = {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  team_name: string;
  team_colour: string | null;
  headshot_url: string | null;
  first_name: string;
  last_name: string;
};

export type SeasonSnapshot = {
  season: string;
  currentRound: number;
  races: ErgastRace[];
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  resultsByRound: Map<number, ErgastRace>;
  sprintByRound: Map<number, ErgastRace>;
  portraits: Record<string, string>;
  teamColors: Record<string, string>;
};

export type FormEntry = {
  round: number;
  raceName: string;
  circuitId: string;
  position: number;
  classified: boolean;
  points: number;
  status: string;
};

export type DriverSeasonStats = {
  driverId: string;
  races: number;
  wins: number;
  podiums: number;
  pointsFinishes: number;
  dnfs: number;
  poles: number;
  avgFinish: number;
  avgGrid: number;
  points: number;
  bestFinish: number;
  form: FormEntry[];
};

export type CareerSeason = {
  season: string;
  races: number;
  wins: number;
  podiums: number;
  points: number;
  bestFinish: number;
  teams: string[];
};

export type CareerSummary = {
  seasons: CareerSeason[];
  races: number;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
  dnfs: number;
  championships: number;
};

export type PredictedOutcome = {
  driverId: string;
  predictedPlace: number;
  expectedScore: number;
  placeRange: [number, number];
  podiumChance: number;
  pointsChance: number;
  winChance: number;
  formLabel: "surging" | "steady" | "fading";
  nextMove: string;
};

export type ChampionshipForecast = {
  driverId: string;
  currentPoints: number;
  predictedPoints: number;
  predictedPlace: number;
  currentPlace: number;
  titleOdds: number;
  remainingMax: number;
};
