"use client";

import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import CssCosmos from "./CssCosmos";

const ThreeScene = lazy(() => import("./CosmicScene"));

function webglOK(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function Cosmos() {
  const [mode, setMode] = useState<"loading" | "three" | "css">("loading");

  useEffect(() => {
    setMode(webglOK() ? "three" : "css");
  }, []);

  if (mode === "css") return <CssCosmos />;
  if (mode === "loading") return <CssCosmos />;

  return (
    <SceneBoundary fallback={<CssCosmos />}>
      <Suspense fallback={<CssCosmos />}>
        <ThreeScene />
      </Suspense>
    </SceneBoundary>
  );
}
