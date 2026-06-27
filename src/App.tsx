// import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import { useEffect, useRef, useState } from "react";

import {
  getCurrentWindow,
  primaryMonitor,
  LogicalPosition,
  currentMonitor,
} from "@tauri-apps/api/window";

import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useNowPlaying } from "./hooks/useNowPlaying";
import {
  pausePlayback,
  resumePlayback,
  skipNext,
  skipBack,
  seekToPosition,
} from "./lib/spotify";

import { SongInfo } from "./components/songInfo";
import { PlayerControls } from "./components/playerControls";
import { ProgressBar } from "./components/progressBar";
import { Login } from "./components/login";

function App() {
  const [visible, setVisible] = useState(true);

  const mainRef = useRef<HTMLDivElement>(null);

  const { accessToken, loading, login } = useSpotifyAuth();

  const { nowPlaying, fetchNowPlaying } = useNowPlaying(accessToken);

  const progress = nowPlaying
    ? (nowPlaying.progress / nowPlaying.duration) * 100
    : 0;

  const prevTrackRef = useRef<string | null>(null);

  const [animate, setAnimate] = useState(true);

  const handleControl = async (action: () => Promise<void>) => {
    if (!accessToken) return;
    try {
      await action();
      setTimeout(fetchNowPlaying, 500);
    } catch (e) {
      console.error("Control action failed:", e);
    }
  };

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
        <Login onLogin={login}/>
      ) : (
        <>
          <SongInfo nowPlaying={nowPlaying} />

          <PlayerControls
            isPlaying={nowPlaying?.isPlaying ?? false}
            onPlayPause={() => {
              if (!nowPlaying) return;
              handleControl(() =>
                nowPlaying.isPlaying
                  ? pausePlayback(accessToken)
                  : resumePlayback(accessToken),
              );
            }}
            onSkipBack={() => handleControl(() => skipBack(accessToken))}
            onSkipNext={() => handleControl(() => skipNext(accessToken))}
          />

          <ProgressBar progress={progress} animate={animate} />
        </>
      )}
    </main>
  );
}

export default App;
