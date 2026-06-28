interface ProgressBarProps {
  progress: number;
  animate: boolean;
}

export function ProgressBar({ progress, animate }: ProgressBarProps) {
  return (
    <div className="pb-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="relative w-60 h-1 bg-gray-700 rounded-full">
        <div
          className="h-full bg-white rounded-full"
          style={{
            width: `${progress}%`,
            transition: animate ? "width 3s linear" : "none",
          }}
        />
      </div>
    </div>
  );
}
