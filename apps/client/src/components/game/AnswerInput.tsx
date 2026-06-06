import { ClientEvent } from "@chameleon/types/events";
import { Button } from "@/components/ui/button";
import { CenteredMessage } from "@/components/ui/centered-message";
import { Textarea } from "@/components/ui/textarea";
import { socket } from "@/socket/client";
import { useGameStore } from "@/store/game-store";

export function AnswerInput() {
  const myQuestion = useGameStore((state) => state.myQuestion);
  const myAnswer = useGameStore((state) => state.myAnswer);
  const setMyAnswer = useGameStore((state) => state.setMyAnswer);
  const hasAnswered = useGameStore((state) => state.hasAnswered);
  const markAnswered = useGameStore((state) => state.markAnswered);

  function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    socket.emit(ClientEvent.SubmitAnswer, myAnswer.trim());
    markAnswered();
  }

  if (hasAnswered) {
    return (
      <CenteredMessage
        title="Answer locked in"
        subtitle="Waiting for everyone else to answer..."
      />
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-6">
      <header>
        <p className="text-muted-foreground text-sm">Your question</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl">{myQuestion}</h1>
      </header>
      <div className="flex flex-col gap-2">
        <label htmlFor="answer" className="font-medium text-sm">
          Your answer
        </label>
        <Textarea
          id="answer"
          value={myAnswer}
          onChange={(event) => setMyAnswer(event.target.value)}
          placeholder="Write your answer here..."
          required
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="mt-auto"
        disabled={myAnswer.trim() === ""}
      >
        Lock in answer
      </Button>
    </form>
  );
}
