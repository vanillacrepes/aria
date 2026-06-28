interface loginProps {
  onLogin: () => void;
}

export function Login({ onLogin } : loginProps) {
  return (
    <div className="w-full h-[60px] flex items-center justify-center">
      <button
        onClick={onLogin}
        className="text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20 hover:border-white hover:bg-white hover:text-black transition-all duration-200"
      >
        Connect Spotify
      </button>
    </div>
  );
}
