
"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const segments = [
  { color: "#8E44AD", label: "500" },
  { color: "#2980B9", label: "200" },
  { color: "#27AE60", label: "1000" },
  { color: "#F1C40F", label: "Try Again" },
  { color: "#E67E22", label: "300" },
  { color: "#E74C3C", label: "Jackpot!" },
  { color: "#16A085", label: "150" },
  { color: "#C0392B", label: "100" },
];

const segCount = segments.length;
const angle = 360 / segCount;

export function SpinWheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio only on the client side
    audioRef.current = new Audio('/sounds/spin-tick.mp3');
    audioRef.current.loop = true;
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }

    const randomSpins = Math.floor(Math.random() * 5) + 5;
    const randomStop = Math.floor(Math.random() * 360);
    const newRotation = rotation + (randomSpins * 360) + randomStop;

    setRotation(newRotation);

    setTimeout(() => {
      const actualRotation = newRotation % 360;
      const winningSegmentIndex = Math.floor((360 - actualRotation + angle / 2) % 360 / angle);
      const prize = segments[winningSegmentIndex].label;

      toast({
        title: "Congratulations!",
        description: `You won: ${prize}`,
      });
      setIsSpinning(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 6000); // Increased duration for a longer spin
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-xs mx-auto">
      {/* Pointer */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
         <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-primary" />
      </div>

      {/* Wheel */}
      <div
        className="relative w-72 h-72 rounded-full border-8 border-primary/80 bg-gray-200 shadow-2xl overflow-hidden transition-transform duration-[6000ms] ease-[cubic-bezier(0.1,0.7,0.3,1)]"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {segments.map((seg, i) => {
          const rotationAngle = i * angle;
          return (
            <div
              key={i}
              className="absolute w-1/2 h-full origin-right"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: seg.color,
                  clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
                  transform: `rotate(${angle / 2}deg)`,
                  transformOrigin: '100% 50%',
                }}
              >
                <div
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{
                    transform: `rotate(${angle / 2}deg) translate(25%, 0) rotate(-${angle}deg)`,
                  }}
                >
                  <span className="text-white font-bold text-sm -rotate-90 block w-max">{seg.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
       {/* Center Hub */}
      <div className="absolute w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full border-4 border-white flex items-center justify-center shadow-inner z-10">
      </div>

      <Button onClick={handleSpin} disabled={isSpinning} className="mt-12 text-lg font-bold py-6 px-10 rounded-full shadow-lg bg-primary hover:bg-primary/90">
        {isSpinning ? "Inazunguka..." : "Zungusha Sasa"}
      </Button>
    </div>
  );
}
