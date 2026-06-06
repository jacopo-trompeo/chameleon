import { useGameStore } from "@/store/game-store";

export function RevealPlayer() {
  const myAnswer = useGameStore((state) => state.myAnswer);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <p className="wrap-break-word font-display text-6xl leading-tight sm:text-7xl md:text-8xl">
        {myAnswer === "" ? "--" : myAnswer}
      </p>
    </div>
  );
}
