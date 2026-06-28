import { NowPlaying } from "../hooks/useNowPlaying";

interface SongInfoProps {
  nowPlaying: NowPlaying | null;
}

export function SongInfo({ nowPlaying }: SongInfoProps) {
  return (
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
        <p className="text-white text-center text-[10px] max-w-[120px] truncate">
          {nowPlaying?.artistName ?? "Nothing playing"}
        </p>
      </div>
    </div>
  );
}
