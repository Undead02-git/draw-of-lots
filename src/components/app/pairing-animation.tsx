'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PairingAnimationProps {
    teams: string[];
    onAnimationComplete: () => void;
    onSkip: () => void;
}

const GATHER_DELAY = 1500;
const MAX_ITEM_DURATION = 1000;
const MIN_ITEM_DURATION = 200;
const DELAY_PER_ITEM = 50;

export function PairingAnimation({ teams, onAnimationComplete, onSkip }: PairingAnimationProps) {
    const [isGathering, setIsGathering] = useState(false);
    const completionTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const gatherTimer = setTimeout(() => {
            setIsGathering(true);
        }, GATHER_DELAY);

        // Calculate the duration for the last item to finish its animation
        const lastItemDelay = (teams.length > 1 ? teams.length - 1 : 0) * DELAY_PER_ITEM;
        const lastItemDuration = MIN_ITEM_DURATION;
        const totalAnimationTime = GATHER_DELAY + lastItemDelay + lastItemDuration + 100;

        completionTimerRef.current = setTimeout(() => {
            onAnimationComplete();
        }, totalAnimationTime);

        return () => {
            clearTimeout(gatherTimer);
            if (completionTimerRef.current) {
                clearTimeout(completionTimerRef.current);
            }
        };
    }, [onAnimationComplete, teams.length]);

    const handleSkip = () => {
        if (completionTimerRef.current) {
            clearTimeout(completionTimerRef.current);
        }
        onSkip();
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm" aria-live="assertive">
            <div className="relative h-full w-full overflow-hidden">
                {teams.map((team, index) => {
                    const angle = Math.random() * 2 * Math.PI;
                    const radius = Math.random() * 25 + 20;
                    const initialX = 50 + radius * Math.cos(angle);
                    const initialY = 50 + radius * Math.sin(angle);
                    const randomRotation = Math.random() * 60 - 30;

                    // Calculate duration: first is slowest, last is fastest
                    const duration = teams.length > 1
                        ? MAX_ITEM_DURATION - (index / (teams.length - 1)) * (MAX_ITEM_DURATION - MIN_ITEM_DURATION)
                        : MAX_ITEM_DURATION;

                    return (
                        <div
                            key={index}
                            className="absolute text-lg font-bold text-foreground transition-all ease-in-out"
                            style={{
                                top: isGathering ? '50%' : `${initialY}%`,
                                left: isGathering ? '50%' : `${initialX}%`,
                                transform: isGathering
                                    ? 'translate(-50%, -50%) scale(0)'
                                    : `translate(-50%, -50%) scale(1) rotate(${randomRotation}deg)`,
                                opacity: isGathering ? 0 : 1,
                                transitionDuration: `${duration}ms`,
                                transitionDelay: `${index * DELAY_PER_ITEM}ms`,
                            }}
                        >
                            {team}
                        </div>
                    );
                })}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse text-primary lucide lucide-box">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                </svg>
                <p className="mt-4 text-xl font-semibold text-primary">Generating Pairings...</p>
            </div>
            <div className="absolute bottom-10 z-10">
                <Button variant="secondary" onClick={handleSkip}>
                    <X className="mr-2 h-4 w-4" />
                    Skip Generation Animation
                </Button>
            </div>
        </div>
    );
}
