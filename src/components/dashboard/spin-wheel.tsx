"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5 to 10 full spins
    const randomStop = Math.floor(Math.random() * 360); // Random stop angle
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
    }, 5000); // Corresponds to transition duration
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-16 border-l-transparent border-r-transparent border-t-primary z-10 drop-shadow-lg" style={{borderTopWidth: '16px'}}></div>
      <div
        className="relative w-64 h-64 rounded-full border-4 border-primary/50 shadow-inner overflow-hidden transition-transform duration-[5000ms] ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            className="absolute w-1/2 h-full origin-right"
            style={{
              transform: `rotate(${i * angle}deg)`,
              clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 50% 50%)`,
            }}
          >
            <div
              className="absolute w-full h-full"
              style={{
                background: seg.color,
                clipPath: `polygon(100% 0, 0 50%, 100% 100%)`,
                transform: 'rotate(-67.5deg)',
                transformOrigin: '50% 50%'
              }}
            >
              <div
                className="flex items-center justify-center h-full w-full text-white font-bold text-sm"
                style={{ transform: `rotate(${angle / 2 + 90}deg) translate(0, -70px)`}}
              >
                {seg.label}
              </div>
            </div>
          </div>
        ))}
         <div
          className="absolute w-full h-full"
          style={{ transform: `rotate(${angle / 2}deg)` }}
        >
          {segments.map((seg, i) => (
            <div
              key={i}
              className="absolute w-1/2 h-full text-white font-bold text-lg flex items-center justify-center origin-right"
              style={{ transform: `rotate(${i * angle}deg) translateX(50%)` }}
            >
              <span className="-rotate-90 ">{/*seg.label*/}</span>
            </div>
          ))}
        </div>
      </div>
       <div className="absolute w-16 h-16 bg-white rounded-full border-4 border-primary/50 flex items-center justify-center shadow-lg">
       </div>
      <Button onClick={handleSpin} disabled={isSpinning} className="mt-8">
        {isSpinning ? "Spinning..." : "Spin Now"}
      </Button>
    </div>
  );
}
