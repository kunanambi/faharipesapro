
"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { SpinConfig } from "@/lib/types";
import { Loader2, Forward } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { claimSpinPrize } from "@/app/admin/spin/actions";

interface SpinPrizes {
    round1_prize: string;
    round2_prize: string;
    round3_prize: string;
}

const WHEEL_SEGMENTS: Omit<SpinConfig, 'id' | 'created_at' | 'spin_order'>[] = [
    { prize_label: "100", prize_color: "#6A3B99" },
    { prize_label: "500", prize_color: "#55A630" },
    { prize_label: "TRY", prize_color: "#E5383B" },
    { prize_label: "250", prize_color: "#C71F66" },
    { prize_label: "80", prize_color: "#F07167" },
    { prize_label: "AGAIN", prize_color: "#E5383B" },
    { prize_label: "120", prize_color: "#0B4DA0" },
    { prize_label: "1000", prize_color: "#0081A7" },
    { prize_label: "TRY", prize_color: "#E5383B" },
    { prize_label: "150", prize_color: "#FFC300" },
    { prize_label: "300", prize_color: "#D4A373" },
    { prize_label: "AGAIN", prize_color: "#E5383B" },
];


export function SpinWheel() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prizes, setPrizes] = useState<SpinPrizes | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [sessionFinished, setSessionFinished] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/sounds/spin-tick.mp3');
    audioRef.current.loop = true;

    const fetchSpinPrizes = async () => {
        const supabase = createClient();
        setLoading(true);
        const { data, error } = await supabase
            .from('spin_configurations')
            .select('round1_prize, round2_prize, round3_prize')
            .eq('id', 1)
            .single();
        
        if (error || !data) {
            toast({ title: "Error", description: "Could not load spin settings.", variant: "destructive" });
        } else {
            setPrizes(data as SpinPrizes);
        }
        setLoading(false);
    }

    fetchSpinPrizes();

  }, [toast]);

  const handleSpin = () => {
    if (isSpinning || !prizes || sessionFinished) return;
    setIsSpinning(true);

    if (audioRef.current) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }

    const randomSpins = Math.floor(Math.random() * 5) + 5; 
    const randomStopAngle = Math.floor(Math.random() * 360);
    const newRotation = rotation + (randomSpins * 360) + randomStopAngle;
    setRotation(newRotation);

    setTimeout(async () => {
      let prizeResult = "0";
      if (currentRound === 1) prizeResult = prizes.round1_prize;
      if (currentRound === 2) prizeResult = prizes.round2_prize;
      if (currentRound === 3) prizeResult = prizes.round3_prize;
      
      const prizeValue = parseInt(prizeResult, 10);
      const isNumericPrize = !isNaN(prizeValue);

      if (isNumericPrize && prizeValue > 0) {
          const { error } = await claimSpinPrize(prizeValue);
          if (error) {
               toast({ title: "Error", description: error, variant: "destructive" });
          } else {
               toast({ title: "Congratulations!", description: `You won: TZS ${prizeValue}` });
          }
      } else {
          toast({ title: "Better luck next time!", description: `You got: ${prizeResult}`, variant: "destructive" });
      }

      if (currentRound < 3) {
          setCurrentRound(prev => prev + 1);
          setIsSpinning(false);
      } else {
          setSessionFinished(true);
          toast({ title: "Game Over", description: "You have completed all rounds for today." });
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, 3000); 
  };

  const angle = 360 / WHEEL_SEGMENTS.length;

  if (loading) {
    return <div className="flex flex-col items-center justify-center h-80"><Loader2 className="h-10 w-10 animate-spin" /><p className="mt-4">Loading Wheel...</p></div>
  }

  if (!prizes) {
    return <div className="text-center h-80 flex items-center justify-center">The spin wheel is not configured yet.</div>
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-sm mx-auto">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>
         <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[30px] border-l-transparent border-r-transparent border-b-yellow-400" />
      </div>

      <div
        className="relative w-80 h-80 rounded-full shadow-2xl overflow-hidden transition-transform duration-[3000ms] ease-[cubic-bezier(0.1,0.7,0.3,1)]"
        style={{ 
            transform: `rotate(${rotation}deg)`,
            boxShadow: '0 0 20px 5px rgba(255, 195, 0, 0.6), inset 0 0 10px rgba(0,0,0,0.5)'
        }}
      >
        <div className="absolute inset-0 w-full h-full rounded-full border-[10px] border-black/50 z-10"/>
        {WHEEL_SEGMENTS.map((seg, i) => {
          const rotationAngle = i * angle;
          return (
            <div
              key={i}
              className="absolute w-1/2 h-full origin-right"
              style={{ transform: `rotate(${rotationAngle}deg)` }}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: seg.prize_color,
                  clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                  transform: 'translateX(-0.5px) rotate(0.5deg)',
                }}
              >
                <div
                  className="absolute w-full h-full flex items-center justify-center"
                  style={{ transform: `translateX(50%) rotate(${angle/2}deg)` }}
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
      
        <div className="absolute w-28 h-28 bg-background rounded-full border-4 border-yellow-400 flex flex-col items-center justify-center shadow-inner z-10"
             style={{ boxShadow: '0 0 15px rgba(255, 195, 0, 0.7), inset 0 0 10px rgba(0,0,0,0.5)'}}>
            <span className="font-bold text-2xl text-white tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>SPIN &</span>
            <span className="font-bold text-3xl text-white tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>WIN!</span>
        </div>

      <div className="mt-8 text-center">
        <p className="text-xl font-bold">Round {currentRound} of 3</p>
        <p className="text-muted-foreground">You have {3 - currentRound + 1} spins remaining.</p>
      </div>

      <Button 
        onClick={handleSpin} 
        disabled={isSpinning || sessionFinished} 
        className="mt-4 text-lg font-bold py-6 px-10 rounded-full shadow-lg bg-primary hover:bg-primary/90"
      >
        {isSpinning ? "Inazunguka..." : sessionFinished ? "Game Over" : "Zungusha Sasa"}
      </Button>
    </div>
  );
}
