import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset() {
    this.setState({ error: null });
  }

  override render(): ReactNode {
    if (this.state.error !== null) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <h1 className="font-display text-3xl">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error occurred. You can try reloading the page.
            </p>
            <Button onClick={this.handleReset}>Try again</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
