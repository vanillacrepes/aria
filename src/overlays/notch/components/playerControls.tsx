import { SkipBack, Play, SkipForward, Pause } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipNext: () => void;
  onSkipBack: () => void;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onSkipNext,
  onSkipBack,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6 pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        className="text-white"
        onClick={onSkipBack}
      >
        <SkipBack size={12} />
      </button>

      <button
        className="w-[16px] h-[16px] rounded-full bg-white text-black flex items-center justify-center"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause size={10} fill="currentColor" />
        ) : (
          <Play size={10} fill="currentColor" />
        )}
      </button>

      <button
        className="text-white"
        onClick={onSkipNext}
      >
        <SkipForward size={12} />
      </button>
    </div>
  );
}
