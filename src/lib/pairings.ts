
type GenerateRound2PairingsInput = {
    round1Pairings: string[][];
    allTeams: string[];
};

export const generateRound2Pairings = ({ round1Pairings, allTeams }: GenerateRound2PairingsInput): string[][] => {
    // For Round 2:
    // Petitioners in R1 (index 0) become Respondents in R2 (index 1)
    // Respondents in R1 (index 1) become Petitioners in R2 (index 0)
    const round2Petitioners = round1Pairings.map(p => p[1]);
    const round2Respondents = round1Pairings.map(p => p[0]);

    const round1PairSet = new Set(
        round1Pairings.map(pair => pair.slice().sort().join('-'))
    );

    const findPairing = (
        petitioners: string[],
        respondents: string[],
        currentPairings: string[][],
        usedRespondents: Set<string>
    ): string[][] | null => {
        if (currentPairings.length === petitioners.length) {
            return currentPairings;
        }

        const currentPetitioner = petitioners[currentPairings.length];

        // Randomize the order of available respondents to ensure varied draws
        const availableRespondents = respondents
            .filter(r => !usedRespondents.has(r))
            .sort(() => 0.5 - Math.random());

        for (const respondent of availableRespondents) {
            const pairKey = [currentPetitioner, respondent].sort().join('-');

            // Constraint 1: No repeat opponents from Round 1
            if (!round1PairSet.has(pairKey)) {
                usedRespondents.add(respondent);
                currentPairings.push([currentPetitioner, respondent]);

                const result = findPairing(petitioners, respondents, currentPairings, usedRespondents);
                if (result) {
                    return result; // Found a valid complete pairing
                }

                // Backtrack
                currentPairings.pop();
                usedRespondents.delete(respondent);
            }
        }

        return null; // No valid pairing found from this path
    };

    // We try multiple times with different initial shuffles to ensure we find a valid pairing if one exists,
    // and to provide variety in the draw.
    const maxAttempts = 50;
    for (let i = 0; i < maxAttempts; i++) {
        const shuffledPetitioners = [...round2Petitioners].sort(() => 0.5 - Math.random());
        const result = findPairing(shuffledPetitioners, round2Respondents, [], new Set());
        if (result) {
            return result;
        }
    }

    throw new Error("Could not find a valid set of pairings for Round 2. The combination of constraints (role reversal and no repeat opponents) is too strict for this set of teams.");
};
