import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!accessToken) return;

    async function fetchNowPlaying() {
      try {
        const data = await getCurrentlyPlaying(accessToken!);

        if (!data || !data.item) {
          setNowPlaying(null);
          return;
        }
        
        setNowPlaying({
          trackName: data.item.name,
          artistName: data.item.artists.map((a: { name: string }) => a.name).join(", "),
          albumArt: data.item.album.images[0]?.url ?? "",
          progress: data.progress_ms,
          duration: data.item.duration_ms,
          isPlaying: data.is_playing,
        });
      } catch (e) {
        console.error("Failed to fetch now playing", e);
      }
    }

    fetchNowPlaying();
    const id = setInterval(fetchNowPlaying, 3000);
    return () => clearInterval(id);
  }, [accessToken]);

  return nowPlaying;
}