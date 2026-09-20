import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loadSeason } from "../lib/api";
import { modelLedger, type Ledger } from "../lib/ledger";
import { predictChampionship, predictRace } from "../lib/predictions";
import type { ChampionshipForecast, PredictedOutcome, SeasonSnapshot } from "../types";

type SeasonState = {
  snapshot: SeasonSnapshot | null;
  loading: boolean;
  error: string | null;
  racePredictions: PredictedOutcome[];
  championship: ChampionshipForecast[];
  ledger: Ledger | null;
};

const SeasonContext = createContext<SeasonState | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<SeasonSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    loadSeason()
      .then((data) => {
        if (live) setSnapshot(data);
      })
      .catch((err: unknown) => {
        if (live) setError(err instanceof Error ? err.message : "Failed to load F1 data");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const racePredictions = useMemo(
    () => (snapshot ? predictRace(snapshot) : []),
    [snapshot],
  );
  const championship = useMemo(
    () => (snapshot ? predictChampionship(snapshot) : []),
    [snapshot],
  );
  const ledger = useMemo(() => (snapshot ? modelLedger(snapshot) : null), [snapshot]);

  const value = useMemo(
    () => ({ snapshot, loading, error, racePredictions, championship, ledger }),
    [snapshot, loading, error, racePredictions, championship, ledger],
  );

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error("useSeason must be used within SeasonProvider");
  return ctx;
}
