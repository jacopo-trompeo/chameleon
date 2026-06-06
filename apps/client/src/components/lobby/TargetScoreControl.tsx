import { MAX_TARGET_SCORE, MIN_TARGET_SCORE } from "@chameleon/types/constants";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TargetScoreControlProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function TargetScoreControl(props: TargetScoreControlProps) {
  const { value, onChange, disabled = false } = props;

  function decrement() {
    onChange(Math.max(MIN_TARGET_SCORE, value - 1));
  }

  function increment() {
    onChange(Math.min(MAX_TARGET_SCORE, value + 1));
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={decrement}
        disabled={disabled || value <= MIN_TARGET_SCORE}
        aria-label="Decrease target score"
      >
        <Minus className="size-4" aria-hidden="true" />
      </Button>
      <div className="min-w-20 text-center">
        <span className="block font-display text-4xl" aria-live="polite">
          {value}
        </span>
        <span className="text-muted-foreground text-xs">points to win</span>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={increment}
        disabled={disabled || value >= MAX_TARGET_SCORE}
        aria-label="Increase target score"
      >
        <Plus className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
