import { useEffect, useRef, useState } from "react";

import {
  getCurrentWindow,
  primaryMonitor,
  LogicalPosition,
  currentMonitor,
} from "@tauri-apps/api/window";

import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

export function useTauriFront() {
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

  return { visible, mainRef, handleTransitionEnd };
}
