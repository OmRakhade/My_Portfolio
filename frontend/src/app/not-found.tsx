import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#0d0e12] px-6 text-zinc-100">
      <div className="w-full max-w-lg">
        <p className="font-mono text-xs uppercase text-purple-300">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          The page you requested doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.09]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </Link>
      </div>
    </main>
  );
}