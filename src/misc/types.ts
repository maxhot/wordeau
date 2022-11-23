export type GameIdKeys = {
   id: number;
   key: string;
   wordID: number;
};

export const enum LetterState {
   ABSENT = 0,
   PRESENT = 1,
   CORRECT = 2
}
export type LetterGuess = {
   letter: string;
   state: LetterState;
}
export const enum ResponseError {
   INVALID_WORD = 400,
   GAME_OVER = 403
}
export type GuessResponse = Array<LetterGuess> | ResponseError


export type HintsByLetter = Map<string, LetterState>;
export type HintsByCorrectPosition = Map<number, string>;