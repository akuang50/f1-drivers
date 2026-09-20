import { Navigate, Route, Routes } from "react-router-dom";
import { Nav } from "./components/Nav";
import { HomePage } from "./pages/HomePage";
import { GridPage } from "./pages/GridPage";
import { DriverPage } from "./pages/DriverPage";
import { CalendarPage } from "./pages/CalendarPage";
import { GrandPrixPage } from "./pages/GrandPrixPage";
import { ChampionshipPage } from "./pages/ChampionshipPage";
import { PredictionsPage } from "./pages/PredictionsPage";

export default function App() {
  return (
    <div className="editorial-bg grain relative min-h-svh text-paper">
      <Nav />
      <main className="relative z-[1]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/grid" element={<GridPage />} />
          <Route path="/drivers/:id" element={<DriverPage />} />
          <Route path="/grands-prix" element={<CalendarPage />} />
          <Route path="/grands-prix/:round" element={<GrandPrixPage />} />
          <Route path="/championship" element={<ChampionshipPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="relative z-[1] mx-auto max-w-[1200px] px-6 py-16">
        <div className="hairline mb-8" />
        <p className="max-w-xl text-[12px] leading-relaxed text-mute">
          Paddock is an unofficial 2026 briefing. Timing and results via Jolpica (Ergast).
          Portraits from Formula 1 / OpenF1. Championship and race forecasts are a form model,
          clearly labeled, never official.
        </p>
      </footer>
    </div>
  );
}
