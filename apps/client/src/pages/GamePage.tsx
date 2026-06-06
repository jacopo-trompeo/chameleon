import { GamePhase } from "@chameleon/types/events";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { AnswerInput } from "@/components/game/AnswerInput";
import { GameMasterView } from "@/components/game/GameMasterView";
import { GameOverScreen } from "@/components/game/GameOverScreen";
import { QuestionInput } from "@/components/game/QuestionInput";
import { RevealGameMaster } from "@/components/game/RevealGameMaster";
import { RevealPlayer } from "@/components/game/RevealPlayer";
import { RoundResultsView } from "@/components/game/RoundResultsView";
import { WaitingForGameMaster } from "@/components/game/WaitingForGameMaster";
import { CenteredMessage } from "@/components/ui/centered-message";
import { Screen } from "@/components/ui/screen";
import {
  PAGE_TRANSITION_DURATION,
  PAGE_TRANSITION_EXIT_OFFSET_Y,
  PAGE_TRANSITION_OFFSET_Y,
} from "@/lib/animations";
import { lobbyExists } from "@/lib/api";
import { useGameStore } from "@/store/game-store";
import { useLobbyStore } from "@/store/lobby-store";

export function GamePage() {
  const params = useParams();
  const code = params.code ?? "";
  const navigate = useNavigate();
  const lobby = useLobbyStore((state) => state.lobby);
  const localPlayerId = useLobbyStore((state) => state.localPlayerId);
  const phase = useGameStore((state) => state.phase);
  const gameMasterId = useGameStore((state) => state.gameMasterId);
  const shouldReduceMotion = useReducedMotion();

  const joined = localPlayerId !== null && lobby?.code === code;

  useEffect(() => {
    if (joined) {
      return;
    }

    let active = true;
    void lobbyExists(code).then((exists) => {
      if (active && !exists) {
        navigate("/");
      }
    });

    return () => {
      active = false;
    };
  }, [joined, code, navigate]);

  if (joined && phase === GamePhase.Lobby) {
    return <Navigate to={`/lobby/${code}`} replace />;
  }

  if (!joined) {
    return <CenteredMessage title="Joining game..." />;
  }

  const isGameMaster = gameMasterId === localPlayerId;

  const phaseComponents: Record<GamePhase, ReactNode> = {
    [GamePhase.Lobby]: null,
    [GamePhase.QuestionInput]: isGameMaster ? (
      <QuestionInput />
    ) : (
      <WaitingForGameMaster />
    ),
    [GamePhase.Answering]: isGameMaster ? <GameMasterView /> : <AnswerInput />,
    [GamePhase.Reveal]: isGameMaster ? <RevealGameMaster /> : <RevealPlayer />,
    [GamePhase.Resolution]: <RoundResultsView isGameMaster={isGameMaster} />,
    [GamePhase.GameOver]: <GameOverScreen />,
  };

  return (
    <Screen>
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: PAGE_TRANSITION_OFFSET_Y }
          }
          animate={{ opacity: 1, y: 0 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: PAGE_TRANSITION_EXIT_OFFSET_Y }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : PAGE_TRANSITION_DURATION,
          }}
          className="flex flex-1 flex-col"
        >
          {phaseComponents[phase]}
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}
