import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = { children: ReactNode; fallback?: ReactNode };

type State = { error: Error | null };

/**
 * Catches any rendering error in the tree below it and shows a visible
 * fallback instead of a blank screen.  Place near the root of your app.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#04050a] px-5">
          <div className="glass max-w-lg rounded-3xl p-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/12 text-rose-300 ring-1 ring-rose-400/25">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-white">
              Something went wrong
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">
              An unexpected error occurred while rendering the page. This is usually
              temporary — try refreshing.
            </p>
            <p className="mt-4 rounded-xl bg-rose-950/20 px-4 py-3 font-mono text-[12px] text-rose-200/80 ring-1 ring-rose-400/20">
              {this.state.error.message}
            </p>
            <button
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(100deg,#7c3aed,#0891b2)] px-5 py-3 text-[14px] font-semibold text-white ring-1 ring-white/20"
            >
              <RefreshCw className="h-4 w-4" /> Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
