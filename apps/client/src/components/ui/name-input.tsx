import { MAX_PLAYER_NAME_LENGTH } from "@chameleon/types/constants";
import { Input } from "@/components/ui/input";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export function NameInput(props: NameInputProps) {
  const { value, onChange, id = "player-name" } = props;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-medium text-sm">
        Your name
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_PLAYER_NAME_LENGTH}
        placeholder="e.g. Robin"
        autoComplete="nickname"
      />
    </div>
  );
}
