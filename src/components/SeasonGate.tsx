import { LoadingScreen } from "../components/LoadingScreen";
import { useSeason } from "../context/SeasonContext";
import type { SeasonSnapshot } from "../types";
import type { ReactNode } from "react";

export function SeasonGate({ children }: { children: (snapshot: SeasonSnapshot) => ReactNode }) {
  const { snapshot, loading, error } = useSeason();
  if (error || loading || !snapshot) return <LoadingScreen />;
  return <>{children(snapshot)}</>;
}
