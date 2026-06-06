import { ClientEvent } from "@chameleon/types/events";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { socket } from "@/socket/client";

export function QuestionInput() {
  const [normalQuestion, setNormalQuestion] = useState("");
  const [impostorQuestion, setImpostorQuestion] = useState("");

  function submit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (normalQuestion.trim() === "" || impostorQuestion.trim() === "") {
      return;
    }

    socket.emit(ClientEvent.SubmitQuestions, {
      normalQuestion: normalQuestion.trim(),
      impostorQuestion: impostorQuestion.trim(),
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl">
          You're the question master
        </h1>
        <p className="mt-2 text-muted-foreground">
          Write two similar questions. Everyone gets the normal one, the
          impostor secretly gets the other.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <label htmlFor="normal-question" className="font-medium text-sm">
          Question for everyone
        </label>
        <Textarea
          id="normal-question"
          value={normalQuestion}
          onChange={(event) => setNormalQuestion(event.target.value)}
          placeholder="What's your favourite holiday destination?"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="impostor-question" className="font-medium text-sm">
          Question for the impostor
        </label>
        <Textarea
          id="impostor-question"
          value={impostorQuestion}
          onChange={(event) => setImpostorQuestion(event.target.value)}
          placeholder="What's a place you'd never want to visit?"
          required
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-auto"
        disabled={
          normalQuestion.trim() === "" || impostorQuestion.trim() === ""
        }
      >
        Send questions
      </Button>
    </form>
  );
}
