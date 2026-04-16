'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { readTeamsFromXLSX, exportPairingsToXLSX } from '@/lib/xlsx';
import { generateRound2Pairings } from '@/lib/pairings';
import { PairingCard } from '@/components/app/pairing-card';
import { PairingAnimation } from '@/components/app/pairing-animation';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileUp, Download, Shuffle, AlertTriangle, RefreshCw, Trash2, X, ChevronsRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type AppState = 'initial' | 'teams_loaded_invalid' | 'teams_loaded_valid' | 'round1_done' | 'round2_done';
type RevealState = 'idle' | 'revealing_round1' | 'revealing_round2';

export default function Home() {
    const [teams, setTeams] = useState<string[]>([]);
    const [round1Pairings, setRound1Pairings] = useState<string[][]>([]);
    const [round2Pairings, setRound2Pairings] = useState<string[][]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState<'round1' | 'round2' | null>(null);
    const [revealState, setRevealState] = useState<RevealState>('idle');
    const [isPending, startTransition] = useTransition();
    const [hasMounted, setHasMounted] = useState(false);

    const pairingCardRef = useRef<HTMLDivElement>(null);
    const skipRevealRef = useRef(false);


    const { toast } = useToast();

    useEffect(() => {
        setHasMounted(true);
        try {
            const savedState = localStorage.getItem('drawOfLotsState');
            if (savedState) {
                const { teams, round1Pairings, round2Pairings, error } = JSON.parse(savedState);
                setTeams(teams || []);
                setRound1Pairings(round1Pairings || []);
                setRound2Pairings(round2Pairings || []);
                setError(error || null);
            }
        } catch (e) {
            console.error("Failed to load state from localStorage", e);
        }
    }, []);

    useEffect(() => {
        if (hasMounted) {
            try {
                const stateToSave = JSON.stringify({ teams, round1Pairings, round2Pairings, error });
                localStorage.setItem('drawOfLotsState', stateToSave);
            } catch (e) {
                console.error("Failed to save state to localStorage", e);
            }
        }
    }, [teams, round1Pairings, round2Pairings, error, hasMounted]);


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        // Reset everything on new upload
        setTeams([]);
        setRound1Pairings([]);
        setRound2Pairings([]);
        setError(null);
        setRevealState('idle');
        skipRevealRef.current = false;

        try {
            const teamCodes = await readTeamsFromXLSX(file);
            if (teamCodes.length === 0) {
                toast({ variant: 'destructive', title: 'File Error', description: "No teams found. Ensure the first sheet has a 'Team Codes' column." });
                return;
            }
            setTeams(teamCodes);
            if (teamCodes.length % 2 !== 0) {
                setError(`An odd number of teams (${teamCodes.length}) was found. Please upload a file with an even number of teams.`);
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'File Read Error', description: e.message || 'An unexpected error occurred.' });
        } finally {
            setIsUploading(false);
            event.target.value = ''; // Allow re-uploading the same file
        }
    };

    const handleGenerateRound1 = () => {
        skipRevealRef.current = false;
        setIsGenerating('round1');
    }

    const performRound1Generation = () => {
        setRevealState('revealing_round1');
        const shuffled = [...teams].sort(() => 0.5 - Math.random());
        const pairs: string[][] = [];
        for (let i = 0; i < shuffled.length; i += 2) {
            pairs.push([shuffled[i], shuffled[i + 1]]);
        }
        setRound1Pairings(pairs);
        setRound2Pairings([]); // Reset Round 2 if Round 1 is re-generated
        setIsGenerating(null);
        toast({
            title: 'Round 1 Generated',
            description: `${pairs.length} pairs created successfully.`,
        });
    };

    const handleGenerateRound2 = () => {
        skipRevealRef.current = false;
        setIsGenerating('round2');
    }

    const performRound2Generation = () => {
        startTransition(() => {
            setRevealState('revealing_round2');
            try {
                const result = generateRound2Pairings({ allTeams: teams, round1Pairings });
                setRound2Pairings(result);
                toast({
                    title: 'Round 2 Generated',
                    description: 'New unique pairings created.',
                });
            } catch (e: any) {
                toast({ variant: 'destructive', title: 'Generation Error', description: e.message || 'Failed to generate Round 2 pairings.' });
            } finally {
                setIsGenerating(null);
            }
        });
    };

    const handleExport = () => {
        exportPairingsToXLSX(round1Pairings, round2Pairings);
        toast({
            title: 'Export Successful',
            description: 'Results downloaded as draw_of_lots_results.xlsx',
        });
    };

    const handleClearPairings = () => {
        setRound1Pairings([]);
        setRound2Pairings([]);
        setRevealState('idle');
        skipRevealRef.current = false;
        toast({
            title: 'Pairings Cleared',
            description: 'The pairing tables have been reset.',
        });
    };

    const handleSkipReveal = () => {
        skipRevealRef.current = true;
        setRevealState('idle');
    }

    const getAppState = (): AppState => {
        if (round2Pairings.length > 0) return 'round2_done';
        if (round1Pairings.length > 0) return 'round1_done';
        if (teams.length > 0) {
            return error ? 'teams_loaded_invalid' : 'teams_loaded_valid';
        }
        return 'initial';
    };

    if (!hasMounted) {
        return null; // or a loading spinner
    }

    const appState = getAppState();
    const isActionDisabled = isUploading || isPending || !!isGenerating || revealState !== 'idle';

    return (
        <>
            {isGenerating && (
                <PairingAnimation
                    teams={teams}
                    onAnimationComplete={isGenerating === 'round1' ? performRound1Generation : performRound2Generation}
                    onSkip={isGenerating === 'round1' ? performRound1Generation : performRound2Generation}
                />
            )}

            <AlertDialog open={appState === 'teams_loaded_invalid'}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-destructive" />
                            Invalid Team Count
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {error}
                            <br /><br />
                            The process cannot continue. Please upload a new file with an even number of teams.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>

            <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <header className="text-center space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline tracking-tight">
                            4th P.N. Mathur National Moot Court Competition, 2025
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Draw of Lots for Preliminary rounds 1 and 2.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <Card className="md:col-span-1 shadow-lg sticky top-8">
                            <CardHeader>
                                <CardTitle>Controls</CardTitle>
                                <CardDescription>Manage the draw process.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold text-primary">{isUploading ? 'Processing...' : 'Click to upload'}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">XLSX file with 'Team Codes'</p>
                                    </div>
                                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx" disabled={isActionDisabled && revealState === 'idle'} />
                                </label>
                                {appState !== 'initial' && appState !== 'teams_loaded_invalid' && (
                                    <div className="p-3 bg-secondary rounded-md text-center">
                                        <Badge variant="default">{teams.length} Teams Loaded</Badge>
                                    </div>
                                )}

                                <Separator />

                                {appState === 'teams_loaded_valid' && (
                                    <Button onClick={handleGenerateRound1} disabled={isActionDisabled} className="w-full">
                                        <Shuffle className="mr-2" /> Generate Round 1
                                    </Button>
                                )}

                                {(appState === 'round1_done' || appState === 'round2_done') && (
                                    <div className="flex gap-2">
                                        <Button onClick={handleGenerateRound1} disabled={isActionDisabled} variant="secondary" className="w-full">
                                            <RefreshCw className="mr-2" /> Redo Round 1
                                        </Button>
                                    </div>
                                )}

                                {(appState === 'round1_done' || appState === 'round2_done') && (
                                    appState === 'round1_done' ? (
                                        <Button onClick={handleGenerateRound2} disabled={isActionDisabled} className="w-full">
                                            <Shuffle className="mr-2" /> Generate Round 2
                                        </Button>
                                    ) : (
                                        <Button onClick={handleGenerateRound2} disabled={isActionDisabled} variant="secondary" className="w-full">
                                            <RefreshCw className="mr-2" /> Redo Round 2
                                        </Button>
                                    )
                                )}

                                {revealState !== 'idle' && (
                                    <Button onClick={handleSkipReveal} variant="outline" className="w-full">
                                        <ChevronsRight className="mr-2" /> Skip Reveal
                                    </Button>
                                )}


                                <Separator />
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={handleExport} disabled={(appState !== 'round1_done' && appState !== 'round2_done') || isActionDisabled} className="w-full">
                                        <Download className="mr-2" /> Export
                                    </Button>
                                    <Button variant="destructive" onClick={handleClearPairings} disabled={(appState !== 'round1_done' && appState !== 'round2_done') || isActionDisabled} className="w-full">
                                        <Trash2 className="mr-2" /> Clear
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="md:col-span-2 space-y-6" ref={pairingCardRef}>
                            <PairingCard
                                title="Round 1 Pairings"
                                pairings={round1Pairings}
                                isRevealing={revealState === 'revealing_round1'}
                                onRevealComplete={() => setRevealState('idle')}
                                skipAnimation={skipRevealRef.current}
                            />
                            <PairingCard
                                title="Round 2 Pairings"
                                pairings={round2Pairings}
                                isRevealing={revealState === 'revealing_round2'}
                                onRevealComplete={() => setRevealState('idle')}
                                skipAnimation={skipRevealRef.current}
                            />
                        </div>

                    </div>
                </div>
            </main>
        </>
    );
}
