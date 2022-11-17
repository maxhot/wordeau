const HOST = "word.digitalnook.net";

export type GameInfo = {
   id: number;
   key: string;
   wordID: number;
};

export const enum ResponseError {
   INVALID_WORD = 400,
   GAME_OVER = 403
}

export const enum LetterState {
   ABSENT = 0,
   PRESENT = 1,
   CORRECT = 2
}

type GuessPayload = {
   id: number;
   key: string;
   guess: string;
};
export type LetterGuess = {
   letter: string;
   state: LetterState;
}
export type GuessResponse = Array<LetterGuess> | ResponseError
async function post(url: string, payload: FinishGamePayload | GuessPayload | null = null) {
   const requestInfo = {
      method: "POST",
      ...(payload && { headers: { "Content-Type": "application/json" } }),
      ...(payload && { body: JSON.stringify(payload) })
   }
   return await fetch(url, requestInfo)
}

export async function startGame(): Promise<GameInfo> {
   const url = `https://${HOST}/api/v1/start_game/`;
   const resp = await post(url)
   return await resp.json();
}

export async function guess(payload: GuessPayload): Promise<GuessResponse> {
   const url = `https://${HOST}/api/v1/guess/`;
   const resp = await post(url, payload)
   if (resp.ok) {
      return await resp.json();
   } else if (resp.status === 400) { // 400 Bad Request - if the word is the wrong length, contains non-letters, or is not in the dictionary
      console.log("Invalid Word!");
      return ResponseError.INVALID_WORD;
   } else if (resp.status === 403) { // 403 Forbidden - if the game has been finished, or already has 6 guesses
      console.log("Game Over!");
      return ResponseError.GAME_OVER;
   }
   throw new Error(`Unexpected Response ${resp}`)
}

type FinishGamePayload = {
   id: number,
   key: string,
}
type FinishGameResponse = {
   answer: string;
}
export async function finishGame(payload: FinishGamePayload): Promise<FinishGameResponse> {
   const url = `https://${HOST}/api/v1/finish_game/`;
   const resp = await post(url, payload)
   return await resp.json();
}

const apis = { startGame, finishGame, guess }
export default apis