
"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Updated segments based on the provided image
const segments = [
    { color: "#6A3B99", label: "TSH 150" },   // Purple
    { color: "#55A630", label: "TSH 500" },   // Green
    { color: "#E5383B", label: "TSH 1,000" }, // Red
    { color: "#C71F66", label: "TSH 2,050" }, // Magenta
    { color: "#F07167", label: "TSH 10,000" },// Orange-Red
    { color: "#0B4DA0", label: "TRY AGAIN" }, // Dark Blue
    { color: "#0081A7", label: "TSH 1,500" }, // Teal
    { color: "#007200", label: "TSH 1,350" }, // Dark Green
    { color: "#FFC300", label: "TSH 100" },   // Yellow
    { color: "#D4A373", label: "TSH 150" },   // Gold
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
    }, 3000); // 3-second spin duration
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-sm mx-auto">
      {/* Pointer */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
         <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[30px] border-l-transparent border-r-transparent border-b-yellow-400" />
      </div>

      {/* Wheel */}
      <div
        className="relative w-80 h-80 rounded-full shadow-2xl overflow-hidden transition-transform duration-[3000ms] ease-[cubic-bezier(0.1,0.7,0.3,1)]"
        style={{ 
            transform: `rotate(${rotation}deg)`,
            boxShadow: '0 0 20px 5px rgba(255, 195, 0, 0.6), inset 0 0 10px rgba(0,0,0,0.5)'
        }}
      >
        <div className="absolute inset-0 w-full h-full rounded-full border-[10px] border-black/50 z-10"/>
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
                  clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                  transform: 'translateX(-0.5px) rotate(0.5deg)', // Small gap fix
                }}
              >
                <div
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{
                    transform: `translateX(50%) rotate(${angle/2}deg)`,
                  }}
                >
                  <span 
                    className="text-white font-bold text-lg -rotate-90 block w-max"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                  >
                      {seg.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
       {/* Center Hub */}
        <div className="absolute w-28 h-28 bg-background rounded-full border-4 border-yellow-400 flex flex-col items-center justify-center shadow-inner z-10"
             style={{ boxShadow: '0 0 15px rgba(255, 195, 0, 0.7), inset 0 0 10px rgba(0,0,0,0.5)'}}>
            <span className="font-bold text-2xl text-white tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>SPIN &</span>
            <span className="font-bold text-3xl text-white tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>WIN!</span>
        </div>

      <Button onClick={handleSpin} disabled={isSpinning} className="mt-12 text-lg font-bold py-6 px-10 rounded-full shadow-lg bg-primary hover:bg-primary/90">
        {isSpinning ? "Inazunguka..." : "Zungusha Sasa"}
      </Button>
    </div>
  );
}
