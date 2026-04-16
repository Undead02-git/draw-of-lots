
type GenerateRound2PairingsInput = {
    round1Pairings: string[][];
    allTeams: string[];
};

export const generateRound2Pairings = ({ round1Pairings, allTeams }: GenerateRound2PairingsInput): string[][] => {
    const round1PairSet = new Set(
        round1Pairings.map(pair => pair.slice().sort().join('-'))
    );

    const round1Petitioners = new Set(round1Pairings.map(pair => pair[0]));
    const round1Respondents = new Set(round1Pairings.map(pair => pair[1]));

    let attempts = 0;
    const maxAttempts = 2000;

    while (attempts < maxAttempts) {
        let potentialNewPetitioners = [...round1Respondents].sort(() => 0.5 - Math.random());
        let potentialNewRespondents = [...round1Petitioners].sort(() => 0.5 - Math.random());

        const newPairings: string[][] = [];
        let pairingsValid = true;

        for (let i = 0; i < potentialNewPetitioners.length; i++) {
            const petitioner = potentialNewPetitioners[i];
            const respondent = potentialNewRespondents[i];
            const pair = [petitioner, respondent];
            const pairKey = pair.slice().sort().join('-');

            if (round1PairSet.has(pairKey)) {
                pairingsValid = false;
                break;
            }
            newPairings.push(pair);
        }

        if (pairingsValid) {
            // Final check to ensure all teams are paired correctly and only once
            const pairedTeams = new Set(newPairings.flat());
            if (pairedTeams.size === allTeams.length) {
                return newPairings;
            }
        }

        attempts++;
    }

    throw new Error("Could not find a valid set of pairings for Round 2 after multiple attempts. The combination of constraints (role reversal and no repeat opponents) is complex, especially with a smaller number of teams. Please try generating again.");
};
