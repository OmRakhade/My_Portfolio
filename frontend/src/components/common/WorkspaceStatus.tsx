import { LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "./Button";

export function WorkspaceLoader() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#0d0e12] px-6 text-center text-zinc-100"
    >
      <LoaderCircle className="h-8 w-8 animate-spin text-purple-300" />
      <div>
        <h1 className="text-lg font-semibold">Preparing your workspace</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Loading portfolio details and workspace documents...
        </p>
      </div>
    </main>
  );
}

interface WorkspaceLoadErrorProps {
  onRetry: () => void;
}

export function WorkspaceLoadError({ onRetry }: WorkspaceLoadErrorProps) {
  return (
    <main
      role="alert"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[#0d0e12] px-6 text-center text-zinc-100"
    >
      <TriangleAlert className="h-8 w-8 text-amber-300" />
      <div className="max-w-md">
        <p className="font-mono text-xs uppercase text-zinc-500">
          Connection issue
        </p>
        <h1 className="mt-2 text-xl font-semibold">
          We couldn&apos;t load your portfolio
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          The API may be unavailable or may not allow this site&apos;s origin.
          Check the connection and try again.
        </p>
      </div>
      <Button type="button" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </main>
  );
}