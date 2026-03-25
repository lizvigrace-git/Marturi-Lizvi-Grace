import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, SquareTerminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'DATA_STREAM_01', artist: 'UNKNOWN_ENTITY', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'CORRUPTED_SECTOR', artist: 'SYS_ADMIN', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'VOID_RESONANCE', artist: 'NULL_POINTER', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((e) => console.error("Audio err:", e));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const playNext = () => { setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length); setIsPlaying(true); };
  const playPrev = () => { setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length); setIsPlaying(true); };

  return (
    <div className="bg-black brutal-border p-6 w-full max-w-md mx-auto flex flex-col items-center gap-6 font-vt323">
      <audio ref={audioRef} src={currentTrack.url} onEnded={playNext} loop={false} />
      
      <div className="flex items-center gap-4 w-full border-b-2 border-[#FF00FF] pb-4">
        <div className="w-16 h-16 bg-[#00FFFF] flex items-center justify-center brutal-border">
          <SquareTerminal className="text-black w-8 h-8" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h2 className="text-[#00FFFF] text-3xl tracking-widest truncate uppercase">
            {currentTrack.title}
          </h2>
          <p className="text-[#FF00FF] text-xl tracking-widest truncate uppercase mt-1">
            &gt; {currentTrack.artist}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 w-full">
        <button onClick={playPrev} className="text-[#00FFFF] hover:text-[#FF00FF] hover:scale-110 transition-transform">
          <SkipBack className="w-10 h-10" />
        </button>
        <button onClick={togglePlay} className="w-16 h-16 flex items-center justify-center bg-[#FF00FF] text-black brutal-border hover:bg-[#00FFFF]">
          {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1" />}
        </button>
        <button onClick={playNext} className="text-[#00FFFF] hover:text-[#FF00FF] hover:scale-110 transition-transform">
          <SkipForward className="w-10 h-10" />
        </button>
      </div>

      <div className="flex items-center gap-4 w-full mt-4 bg-[#111] p-2 border border-[#00FFFF]">
        <button onClick={() => setIsMuted(!isMuted)} className="text-[#FF00FF] hover:text-[#00FFFF]">
          {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
          className="flex-1 h-2 bg-black border border-[#FF00FF] appearance-none cursor-pointer accent-[#00FFFF]"
        />
      </div>
    </div>
  );
}
