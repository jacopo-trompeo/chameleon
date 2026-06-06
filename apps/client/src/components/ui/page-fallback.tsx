export function PageFallback() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-background"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="text-muted-foreground">Loading...</span>
    </div>
  );
}
