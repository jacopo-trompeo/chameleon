import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea(props: TextareaProps) {
  const { className, ...rest } = props;

  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-2xl border border-input bg-background px-4 py-3 text-base ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  );
}
