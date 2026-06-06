import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_0_0_rgb(0_0_0/0.16)] hover:bg-primary/90 active:translate-y-0.5 active:shadow-[0_2px_0_0_rgb(0_0_0/0.16)] disabled:translate-y-0 disabled:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_4px_0_0_rgb(0_0_0/0.10)] hover:bg-secondary/80 active:translate-y-0.5 active:shadow-[0_2px_0_0_rgb(0_0_0/0.10)] disabled:translate-y-0 disabled:shadow-none",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_4px_0_0_rgb(0_0_0/0.16)] hover:bg-destructive/90 active:translate-y-0.5 active:shadow-[0_2px_0_0_rgb(0_0_0/0.16)] disabled:translate-y-0 disabled:shadow-none",
        outline:
          "border-2 border-input bg-card hover:bg-accent hover:text-accent-foreground active:bg-accent/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:bg-accent/70",
      },
      size: {
        default: "h-11 px-5 py-2",
        lg: "h-14 px-8 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button(props: ButtonProps) {
  const { className, variant, size, type, ...rest } = props;

  return (
    <button
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    />
  );
}
