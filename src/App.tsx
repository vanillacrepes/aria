import React, { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

import "./App.css";

const overlays: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  "notch": React.lazy(() =>
    import("./overlays/notch/Notch").then((m) => ({
      default: m.Notch,
    }))
  ),
  "main-overlay": React.lazy(() =>
    import("./overlays/mainOverlay/MainOverlay").then((m) => ({
      default: m.MainOverlay,
    }))
  ),
};

export default function App() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(getCurrentWindow().label);
  }, []);

  if (!label) return null;

  const Component = overlays[label];

  if (!Component) {
    console.error(`No component labeled :${label}`);
    return null;
  }

  return (
    <React.Suspense fallback={null}>
      <Component />
    </React.Suspense>
  )
}
