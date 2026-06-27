import { useEffect, useState, useCallback } from "react";
import { getCurrentlyPlaying } from "../lib/spotify";

export interface NowPlaying {
  trackName: string;
  artistName: string;
  albumArt: string;
  progress: number;
  duration: number;
  isPlaying: boolean;
}

export function useNowPlaying(accessToken: string | null) {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    if (!accessToken) return;

    try {
      const data = await getCurrentlyPlaying(accessToken!);

      if (!data || !data.item) {
        setNowPlaying(null);
        return;
      }

      setNowPlaying({
        trackName: data.item.name,
        artistName: data.item.artists
          .map((a: { name: string }) => a.name)
          .join(", "),
        albumArt: data.item.album.images[0]?.url ?? "",
        progress: data.progress_ms,
        duration: data.item.duration_ms,
        isPlaying: data.is_playing,
      });
    } catch (e) {
      console.error("Failed to fetch now playing", e);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    fetchNowPlaying();

    const id = setInterval(fetchNowPlaying, 3000);
    return () => clearInterval(id);
  }, [accessToken, fetchNowPlaying])

  return { nowPlaying, fetchNowPlaying};
}
