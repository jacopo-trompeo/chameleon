import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LobbyCodeProps {
  code: string;
}

const COPIED_RESET_MS = 1500;

export function LobbyCode(props: LobbyCodeProps) {
  const { code } = props;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, COPIED_RESET_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-muted-foreground text-sm">Lobby code</span>
      <div className="flex items-center gap-2">
        <span className="font-display text-4xl tracking-[0.35em]">{code}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={copy}
          aria-label={copied ? "Lobby code copied" : "Copy lobby code"}
        >
          {copied ? (
            <Check className="size-5 text-primary" aria-hidden="true" />
          ) : (
            <Copy className="size-5" aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}
