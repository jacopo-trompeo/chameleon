import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";

interface CenteredMessageProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}

export function CenteredMessage(props: CenteredMessageProps) {
  const { icon = <Spinner className="size-10" />, title, subtitle } = props;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      {icon}
      <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
      {subtitle !== undefined ? (
        <p className="text-muted-foreground" aria-live="polite">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
