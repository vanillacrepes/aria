// externals
import "../../App.css";

// react
import { useEffect, useRef, useState } from "react";

// hooks
import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useNowPlaying } from "./hooks/useNowPlaying";
import { useTauriFront } from "./hooks/useTauriFront";
import { useProgressAnimation } from "./hooks/useProgressAnimation";

// lib
import {
  pausePlayback,
  resumePlayback,
  skipNext,
  skipBack,
  seekToPosition,
} from "./lib/spotify";

// components
import { SongInfo } from "./components/songInfo";
import { PlayerControls } from "./components/playerControls";
import { ProgressBar } from "./components/progressBar";
import { Login } from "./components/login";

export function Notch() {
  const { accessToken, loading, login } = useSpotifyAuth();

  const { nowPlaying, fetchNowPlaying } = useNowPlaying(accessToken);

  const { visible, mainRef, handleTransitionEnd } = useTauriFront();

  const animate = useProgressAnimation(nowPlaying?.trackName);

  const progress = nowPlaying
    ? (nowPlaying.progress / nowPlaying.duration) * 100
    : 0;

  const handleControl = async (action: () => Promise<void>) => {
    if (!accessToken) return;
    try {
      await action();
      setTimeout(fetchNowPlaying, 500);
    } catch (e) {
      console.error("Control action failed:", e);
    }
  };

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
        <Login onLogin={login} />
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