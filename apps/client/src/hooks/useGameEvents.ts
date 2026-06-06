import { ServerEvent } from "@chameleon/types/events";
import { useEffect } from "react";
import { socket } from "@/socket/client";
import { useGameStore } from "@/store/game-store";

export function useGameEvents(): void {
  const setRoundStarted = useGameStore((state) => state.setRoundStarted);
  const setAllAnswersReady = useGameStore((state) => state.setAllAnswersReady);
  const setRoundResolved = useGameStore((state) => state.setRoundResolved);
  const setGameOver = useGameStore((state) => state.setGameOver);

  useEffect(() => {
    socket.on(ServerEvent.RoundStarted, setRoundStarted);
    socket.on(ServerEvent.AllAnswersReady, setAllAnswersReady);
    socket.on(ServerEvent.RoundResolved, setRoundResolved);
    socket.on(ServerEvent.GameOver, setGameOver);

    return () => {
      socket.off(ServerEvent.RoundStarted, setRoundStarted);
      socket.off(ServerEvent.AllAnswersReady, setAllAnswersReady);
      socket.off(ServerEvent.RoundResolved, setRoundResolved);
      socket.off(ServerEvent.GameOver, setGameOver);
    };
  }, [setRoundStarted, setAllAnswersReady, setRoundResolved, setGameOver]);
}
