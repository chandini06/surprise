import { useEffect, useRef, useState } from "react";
import photo1 from "./assets/photo1.jpg";
import photo2 from "./assets/photo2.jpg";
import photo3 from "./assets/photo3.jpg";

const DEFAULTS = [photo1, photo2, photo3] as const;
const CAPTIONS = ["Us ❤️", "My favorite memories 🥹", "My favorite person ❤️"];

const isValidImageSource = (value: string | null | undefined) => {
  if (!value) return false;
  return /^data:image\//.test(value) || /^\//.test(value) || /^https?:\/\//.test(value);
};

function Btn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-10 rounded-full bg-primary px-8 py-3.5 text-lg font-semibold text-primary-foreground shadow-soft transition-transform hover:scale-105 active:scale-95"
    >
      {children}
    </button>
  );
}

function Hearts() {
  const hearts = Array.from({ length: 12 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {hearts.map((i) => (
        <span
          key={i}
          className="animate-float-up absolute bottom-[-40px] text-primary/40"
          style={{
            left: `${(i * 83) % 100}%`,
            fontSize: `${14 + ((i * 7) % 18)}px`,
            animationDuration: `${10 + ((i * 3) % 8)}s`,
            animationDelay: `${(i * 1.3) % 10}s`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

function useMusic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const timer = useRef<number | null>(null);
  const [on, setOn] = useState(false);
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 523.25, 659.25, 783.99, 1046.5];

  const toggle = () => {
    if (on) {
      if (timer.current) clearInterval(timer.current);
      ctxRef.current?.close();
      ctxRef.current = null;
      setOn(false);
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    let i = 0;
    const play = () => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = notes[i++ % notes.length] ?? 523.25;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 1.5);
    };

    play();
    timer.current = window.setInterval(play, 600);
    setOn(true);
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
      ctxRef.current?.close();
    };
  }, []);

  return { on, toggle };
}

function Gallery({ onNext }: { onNext: () => void }) {
  const [photos, setPhotos] = useState<string[]>([...DEFAULTS]);

  useEffect(() => {
    const saved = DEFAULTS.map((defaultSrc, i) => {
      const stored = localStorage.getItem(`photo-${i}`);
      return isValidImageSource(stored) ? stored : defaultSrc;
    });
    setPhotos(saved);
  }, []);

  const replace = (i: number, file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const url = r.result as string;
      try {
        localStorage.setItem(`photo-${i}`, url);
      } catch {
        // too large, keep for session
      }
      setPhotos((p) => p.map((x, j) => (j === i ? url : x)));
    };
    r.readAsDataURL(file);
  };

  return (
    <>
      <h2 className="font-script text-5xl text-primary">Our Memories</h2>
      <div className="mt-8 flex flex-wrap justify-center gap-6">
        {photos.map((src, i) => (
          <label
            key={i}
            className="group relative cursor-pointer bg-card p-3 pb-4 shadow-soft transition-transform hover:rotate-0 hover:scale-105"
            style={{ transform: `rotate(${[-4, 2, -2][i]}deg)` }}
            title="Tap to replace photo"
          >
            <img src={src} alt={CAPTIONS[i]} className="h-64 w-48 object-cover sm:h-72 sm:w-56" />
            <p className="mt-3 font-script text-2xl">{CAPTIONS[i]}</p>
            <span className="absolute right-4 top-4 rounded-full bg-card/90 px-2 py-0.5 text-xs opacity-0 transition-opacity group-hover:opacity-100">
              change
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => replace(i, e.target.files?.[0])} />
          </label>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Tap a photo to replace it</p>
      <Btn onClick={onNext}>Next 💕</Btn>
    </>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => s + 1);
  const music = useMusic();

  const screens = [
    <>
      <h1 className="font-script text-6xl text-primary sm:text-7xl">Hey You ❤️</h1>
      <p className="mt-4 text-xl">I have a little surprise for you...</p>
      <Btn onClick={next}>Click Here 👀</Btn>
    </>,
    <>
      <div className="animate-heartbeat text-8xl">💝</div>
      <h1 className="mt-6 font-script text-5xl text-primary">First surprise for you... ❤️</h1>
      <p className="mt-4 text-xl">But wait... there's more!</p>
      <Btn onClick={next}>Click Here 💌</Btn>
    </>,
    <>
      <h1 className="font-script text-6xl text-primary sm:text-7xl">Happy Boyfriend's Day ❤️</h1>
      <p className="mx-auto mt-6 max-w-md text-xl">Today is your day, so I wanted to make something just for you.</p>
      <Btn onClick={next}>One More Surprise 👀</Btn>
    </>,
    <Gallery onNext={next} />,
    <>
      <p className="font-script text-4xl text-primary">I just want you to know...</p>
      <p className="mx-auto mt-8 max-w-lg text-xl leading-relaxed">
        You are very special to me. Thank you for being such a beautiful part of my life. I love you more than words
        can explain. ❤️
      </p>
      <Btn onClick={next}>One Last Thing 💕</Btn>
    </>,
    <>
      <h1 className="animate-heartbeat font-script text-7xl font-bold text-primary sm:text-9xl">I LOVE YOU ❤️</h1>
      <p className="mt-8 text-2xl">Happy Boyfriend's Day, my love! 🫶</p>
      <button onClick={() => setStep(0)} className="mt-12 text-sm text-muted-foreground underline">
        start again
      </button>
    </>,
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <Hearts />
      <button
        onClick={music.toggle}
        className="fixed right-4 top-4 z-10 rounded-full bg-card/80 px-4 py-2 text-sm shadow-soft backdrop-blur"
      >
        {music.on ? "🎵 Music ON" : "🔇 Music OFF"}
      </button>
      <div key={step} className="relative z-[1] w-full text-center animate-in fade-in zoom-in-95 duration-700">
        {screens[step]}
      </div>
    </main>
  );
}
