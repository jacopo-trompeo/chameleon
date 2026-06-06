import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ScreenProps
  extends Pick<HTMLAttributes<HTMLElement>, "children" | "className"> {}

export function Screen(props: ScreenProps) {
  const { children, className } = props;

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="-left-24 -top-24 absolute size-72 rounded-full bg-primary/20" />
        <div className="-right-24 absolute top-1/4 size-80 rounded-full bg-accent" />
        <div className="-bottom-28 absolute left-1/5 size-72 rounded-full bg-secondary" />
      </div>
      <main
        className={cn(
          "relative z-10 flex min-h-dvh w-full max-w-md flex-col gap-6 bg-card p-6 sm:max-h-[calc(100dvh-3rem)] sm:min-h-0 sm:overflow-y-auto sm:rounded-4xl sm:p-8 sm:shadow-2xl",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
