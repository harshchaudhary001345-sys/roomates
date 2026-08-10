import { Component, type ReactNode } from "react";

/**
 * Fails gracefully to a pure-CSS cosmic backdrop if WebGL is
 * unavailable (older devices, hardware-accel disabled, headless renders).
 */
export default class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    /* swallow — the fallback is purely decorative */
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-float-slow absolute top-[18%] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.35),transparent_65%)] blur-3xl" />
          <div className="animate-float-mid absolute bottom-[8%] left-1/4 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(8,145,178,0.3),transparent_65%)] blur-3xl" />
          <div className="animate-float-slow absolute right-[12%] bottom-[22%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(52,226,176,0.22),transparent_65%)] blur-3xl" />
        </div>
      );
    }
    return this.props.children;
  }
}
