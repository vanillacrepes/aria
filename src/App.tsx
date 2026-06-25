// import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import { useEffect, useRef, useState } from "react";

import {
  getCurrentWindow,
  primaryMonitor,
  LogicalPosition,
  currentMonitor,
} from "@tauri-apps/api/window";

import { SkipBack, Play, SkipForward } from "lucide-react";

import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

function App() {
  const [visible, setVisible] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function centerNotch() {
      const monitor = (await currentMonitor()) ?? (await primaryMonitor());
      if (!monitor) return;

      const notchWidth = 300;
      const scaleFactor = monitor.scaleFactor;

      const screenWidth = monitor.size.width / scaleFactor;
      const x = Math.round(screenWidth / 2 - notchWidth / 2);

      await getCurrentWindow().setPosition(new LogicalPosition(x, 0));
    }

    centerNotch();

    register("CommandOrControl+Shift+S", async (event) => {
      if (event.state !== "Pressed") return;
      
      const win = getCurrentWindow();
      const isVisible = await win.isVisible();

      if (isVisible) {
        setVisible(false);
      } else {
        await win.show();
        setVisible(true);
      }
    });

    return () => {
      unregister("CommandOrControl+Shift+S");
    };
  }, []);

  function handleTransitionEnd() {
    if (!visible) {
      getCurrentWindow().hide();
    }
  }

  const progress = 32;

  return (
    <main
      ref={mainRef}
      onTransitionEnd={handleTransitionEnd}
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className="w-full h-full bg-black rounded-b-3xl overflow-hidden"
    >
      <div className="w-full h-[60px] flex items-center justify-center gap-4">
        <img
          src="https://i.scdn.co/image/ab67616d0000b2736a2ae719c17dbeec2682a4b7"
          alt=""
          className="w-[40px] h-[40px] rounded-lg"
        />

        <div className="flex-col items-center justify-center">
          <p className="text-white text-center text-sm">LLORONiTA</p>
          <p className="text-white text-center text-[10px]">Ella Boh</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pb-2">
        <button className="text-white">
          <SkipBack size={12} />
        </button>

        <button className="w-[16px] h-[16px] rounded-full bg-white text-black flex items-center justify-center">
          <Play size={10} fill="currentColor" />
        </button>

        <button className="text-white">
          <SkipForward size={12} />
        </button>
      </div>

      <div className="pb-2 flex items-center justify-center">
        <div className="relative w-60 h-1 bg-gray-700 rounded-full">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />

          <div
            className="absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-y-1/2"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
