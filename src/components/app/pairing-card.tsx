
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

type PairingCardProps = {
    title: string;
    pairings: string[][];
    isRevealing: boolean;
    onRevealComplete: () => void;
    skipAnimation: boolean;
};

const REVEAL_INTERVAL_MS = 3000;
const SCROLL_DELAY_MS = 100;

export function PairingCard({ title, pairings, isRevealing, onRevealComplete, skipAnimation }: PairingCardProps) {
    const [visiblePairings, setVisiblePairings] = useState<string[][]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const listRef = useRef<HTMLUListElement | null>(null);
    const itemToAnimateIndex = useRef<number | null>(null);

    useEffect(() => {
        if (skipAnimation) {
            setVisiblePairings(pairings);
            setIsAnimating(false);
            itemToAnimateIndex.current = null;
            return;
        }

        if (!isRevealing) {
            // If we are not revealing, but pairings are present, show them all (e.g. on page load from local storage)
            if (pairings.length > 0 && visiblePairings.length !== pairings.length) {
                setVisiblePairings(pairings);
            }
            return;
        }

        // Reset state for new reveal sequence
        setVisiblePairings([]);
        setIsAnimating(false);
        itemToAnimateIndex.current = null;
        let revealTimer: NodeJS.Timeout;

        const revealNextPair = (index: number) => {
            if (index >= pairings.length) {
                setIsAnimating(false);
                itemToAnimateIndex.current = null;
                onRevealComplete();
                return;
            }

            itemToAnimateIndex.current = index;
            setIsAnimating(true);
            setVisiblePairings((prev) => [...prev, pairings[index]]);

            revealTimer = setTimeout(() => {
                setIsAnimating(false);
                revealNextPair(index + 1);
            }, REVEAL_INTERVAL_MS);
        };

        const initialTimeout = setTimeout(() => revealNextPair(0), 500);

        return () => {
            clearTimeout(initialTimeout);
            clearTimeout(revealTimer);
        };
    }, [isRevealing, pairings, skipAnimation, onRevealComplete]);


    // Effect for auto-scrolling
    useEffect(() => {
        if (isAnimating && listRef.current) {
            const lastChild = listRef.current.lastElementChild;
            if (lastChild) {
                setTimeout(() => {
                    lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, SCROLL_DELAY_MS);
            }
        }
    }, [visiblePairings.length, isAnimating]);


    return (
        <Card className="shadow-lg w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users className="h-5 w-5" />
                    </span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[150px]">
                {visiblePairings.length > 0 ? (
                    <>
                        <div className="flex justify-between px-3 pb-2 text-sm font-medium text-muted-foreground">
                            <span>Petitioner</span>
                            <span>Respondent</span>
                        </div>
                        <ul ref={listRef} className="space-y-3">
                            {visiblePairings.map((pair, index) => {
                                const shouldAnimate = isAnimating && itemToAnimateIndex.current === index;
                                return (
                                    <li
                                        key={index}
                                        className={`relative flex items-center justify-between rounded-md border bg-secondary/50 p-3 text-secondary-foreground transition-all duration-500 ease-in-out
                      ${shouldAnimate ? 'z-10' : ''}`}
                                        style={{
                                            animation: shouldAnimate ? `pop-out ${REVEAL_INTERVAL_MS}ms ease-in-out` : 'none',
                                        }}
                                    >
                                        <span className="font-medium text-left w-2/5 truncate">{pair[0]}</span>
                                        <Swords className="h-5 w-5 text-primary flex-shrink-0 mx-2" />
                                        <span className="font-medium text-right w-2/5 truncate">{pair[1]}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center text-muted-foreground">
                        <p>Pairings will appear here once generated.</p>
                    </div>
                )}
            </CardContent>
            <style jsx global>{`
        @keyframes pop-out {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(0,0,0,0);
          }
          30% {
            transform: scale(1.25);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          70% {
            transform: scale(1.25);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(0,0,0,0);
          }
        }
      `}</style>
        </Card>
    );
}
