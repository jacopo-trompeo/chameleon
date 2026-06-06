import { Loader2 } from "lucide-react";
import type { SVGAttributes } from "react";
import { cn } from "@/lib/cn";

interface SpinnerProps
  extends Pick<SVGAttributes<SVGSVGElement>, "className"> {}

export function Spinner(props: SpinnerProps) {
  const { className } = props;

  return (
    <Loader2
      className={cn("size-7 text-primary motion-safe:animate-spin", className)}
      aria-hidden="true"
    />
  );
}
