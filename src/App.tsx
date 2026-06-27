// import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import { useEffect, useRef, useState } from "react";

import {
  getCurrentWindow,
  primaryMonitor,
  LogicalPosition,
  currentMonitor,
} from "@tauri-apps/api/window";

import { SkipBack, Play, SkipForward, Pause } from "lucide-react";

import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useNowPlaying } from "./hooks/useNowPlaying";
import {
  pausePlayback,
  resumePlayback,
  skipNext,
  skipBack,
  seekToPosition
} from "./lib/spotify";

function App() {
  const [visible, setVisible] = useState(true);

  const mainRef = useRef<HTMLDivElement>(null);

  const { accessToken, loading, login } = useSpotifyAuth();

  const nowPlaying = useNowPlaying(accessToken);

  const progress = nowPlaying
    ? (nowPlaying.progress / nowPlaying.duration) * 100
    : 0;

  const prevTrackRef = useRef<string | null>(null);
  
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const track = nowPlaying?.trackName ?? null;
    if (prevTrackRef.current !== null && prevTrackRef.current !== track) {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
    }
    prevTrackRef.current = track;
  }, [nowPlaying?.trackName]);

  useEffect(() => {
    if (accessToken) console.log("token:", accessToken);

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
  }, [accessToken]);

  function handleTransitionEnd() {
    if (!visible) {
      getCurrentWindow().hide();
    }
  }

  return (
    <main
      ref={mainRef}
      onTransitionEnd={handleTransitionEnd}
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition:
          "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s ease-in-out",
      }}
      className={`w-full bg-black rounded-b-3xl overflow-hidden group h-[60px] ${accessToken ? "hover:h-[100px]" : ""}`}
    >
      {!accessToken ? (
        <div className="w-full h-[60px] flex items-center justify-center">
          <button
            onClick={login}
            className="text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all duration-200"
          >
            Connect Spotify
          </button>
        </div>
      ) : (
        <>
          {/* song data container */}
          <div className="w-full h-[60px] flex items-center justify-center gap-4">
            <img
              src={nowPlaying?.albumArt ?? ""}
              alt=""
              className="w-[40px] h-[40px] rounded-lg"
            />

            <div className="flex-col items-center justify-center">
              <p className="text-white text-center text-sm max-w-[120px] truncate">
                {nowPlaying?.trackName ?? "—"}
              </p>
              <p className="text-white text-center text-[10px]">
                {nowPlaying?.artistName ?? "Nothing playing"}
              </p>
            </div>
          </div>

          {/* controls */}
          <div className="flex items-center justify-center gap-6 pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className="text-white"
              onClick={() => accessToken && skipBack(accessToken)}
            >
              <SkipBack size={12} />
            </button>

            <button
              className="w-[16px] h-[16px] rounded-full bg-white text-black flex items-center justify-center"
              onClick={() => {
                if (!accessToken) return;
                nowPlaying?.isPlaying
                  ? pausePlayback(accessToken)
                  : resumePlayback(accessToken);
              }}
            >
              {nowPlaying?.isPlaying ? (
                <Pause size={10} fill="currentColor" />
              ) : (
                <Play size={10} fill="currentColor" />
              )}
            </button>

            <button
              className="text-white"
              onClick={() => accessToken && skipNext(accessToken)}
            >
              <SkipForward size={12} />
            </button>
          </div>

          {/* progress bar */}
          <div className="pb-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="relative w-60 h-1 bg-gray-700 rounded-full">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${progress}%`,
                  transition: animate ? "width 3s linear" : "none",
                }}
              />

                {/* I will actually make this work when I feel like it
              <div
                className="absolute top-1/2 w-3 h-3 bg-white rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100"
                style={{
                  left: `calc(${progress}% - 6px)`,
                  transition: animate
                    ? "left 3s linear, opacity 0.3s ease-in-out"
                    : "opacity 0.3s ease-in-out",
                }}
              /> */}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default App;
