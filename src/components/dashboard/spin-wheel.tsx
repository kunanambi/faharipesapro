
"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { SpinConfig } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SpinWheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [segments, setSegments] = useState<SpinConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/spin-tick.mp3');
    audioRef.current.loop = true;

    const fetchSpinConfig = async () => {
        const supabase = createClient();
        setLoading(true);
        const { data, error } = await supabase
            .from('spin_configurations')
            .select('*')
            .order('spin_order', { ascending: true });
        
        if (error) {
            toast({ title: "Error", description: "Could not load spin wheel settings." });
            setSegments([]);
        } else {
            setSegments(data as SpinConfig[]);
        }
        setLoading(false);
    }

    fetchSpinConfig();

  }, [toast]);

  const handleSpin = () => {
    if (isSpinning || segments.length === 0) return;
    setIsSpinning(true);

    if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }

    const randomSpins = Math.floor(Math.random() * 5) + 5; // Revolutions
    const randomStopAngle = Math.floor(Math.random() * 360); // Random stop position
    const newRotation = rotation + (randomSpins * 360) + randomStopAngle;

    setRotation(newRotation);

    setTimeout(() => {
      const anglePerSegment = 360 / segments.length;
      const finalRotation = newRotation % 360;
      // The pointer is at the top (0 degrees), but CSS rotate starts from the right. We adjust by 90 degrees.
      // We also add half a segment angle to center the pointer within a segment.
      const winningSegmentIndex = Math.floor(((360 - finalRotation + 90 + anglePerSegment / 2) % 360) / anglePerSegment);
      
      const prize = segments[winningSegmentIndex]?.prize_label;

      if (prize) {
          toast({
            title: prize === "TRY AGAIN" ? "Better luck next time!" : "Congratulations!",
            description: prize !== "TRY AGAIN" ? `You won: ${prize}` : "You can spin again tomorrow.",
            variant: prize === "TRY AGAIN" ? "destructive" : "default",
          });
      }

      setIsSpinning(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 3000); // 3-second spin duration
  };

  const angle = segments.length > 0 ? 360 / segments.length : 0;

  if (loading) {
    return <div className="flex flex-col items-center justify-center h-80"><Loader2 className="h-10 w-10 animate-spin" /><p className="mt-4">Loading Wheel...</p></div>
  }

  if (segments.length === 0) {
    return <div className="text-center h-80 flex items-center justify-center">The spin wheel is not configured yet.</div>
  }

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
                  backgroundColor: seg.prize_color,
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
                      {seg.prize_label}
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
