import { useEffect, useRef, useState } from "react";

export function useProgressAnimation(trackName: string | undefined) {
  const prevTrackRef = useRef<string | null>(null);

  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const track = trackName ?? null;
    if (prevTrackRef.current !== null && prevTrackRef.current !== track) {
      setAnimate(false);
      setTimeout(() => setAnimate(true), 50);
    }
    prevTrackRef.current = track;
  }, [trackName]);

  return animate
}
