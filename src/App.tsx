import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-vt323 relative overflow-hidden scanlines">
      <div className="static-noise"></div>
      
      <main className="container mx-auto px-4 py-8 min-h-screen flex flex-col relative z-10 screen-tear">
        <header className="mb-12 text-center flex flex-col items-center mt-8">
          <h1 
            className="text-5xl md:text-7xl font-pixel uppercase tracking-tighter glitch-text mb-4"
            data-text="SYS.OVERRIDE"
          >
            SYS.OVERRIDE
          </h1>
          <p className="text-[#FF00FF] mt-2 tracking-[0.2em] uppercase text-xl md:text-2xl font-bold bg-[#00FFFF] text-black px-2">
            // AUDIO-VISUAL_CORRUPTION_DETECTED //
          </p>
        </header>

        <div className="flex-1 flex flex-col items-center justify-start gap-16 pb-12">
          <div className="w-full flex justify-center flex-shrink-0">
            <SnakeGame />
          </div>
          
          <div className="w-full flex justify-center flex-shrink-0">
            <MusicPlayer />
          </div>
        </div>
      </main>
    </div>
  );
}

