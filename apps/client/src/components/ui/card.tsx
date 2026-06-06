import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card(props: CardProps) {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-muted p-6 text-card-foreground",
        className,
      )}
      {...rest}
    />
  );
}
