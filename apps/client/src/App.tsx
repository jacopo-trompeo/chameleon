import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Notifications } from "@/components/ui/notifications";
import { PageFallback } from "@/components/ui/page-fallback";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useLobbyEvents } from "@/hooks/useLobbyEvents";

const HomePage = lazy(() =>
  import("@/pages/HomePage").then((module) => ({ default: module.HomePage })),
);
const LobbyPage = lazy(() =>
  import("@/pages/LobbyPage").then((module) => ({ default: module.LobbyPage })),
);
const GamePage = lazy(() =>
  import("@/pages/GamePage").then((module) => ({ default: module.GamePage })),
);

export function App() {
  useLobbyEvents();
  useGameEvents();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lobby/:code" element={<LobbyPage />} />
            <Route path="/game/:code" element={<GamePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
        <Notifications />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
