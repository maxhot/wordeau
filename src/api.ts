// import fetch from "./fakeFetch";

const HOST = "word.digitalnook.net";

type GuessBody = {
   id: number;
   key: string;
   guess: string;
};

export type GameInfo = {
   id: number;
   key: string;
   wordID: number;
};

export const RESPONSE_INVALID_WORD = 400;
export const RESPONSE_GAME_OVER = 403;

export const enum ErrorResponse {
   InvalidWord = 400,
   GameOver = 403
}

export const enum LetterState {
   ABSENT = 0,
   PRESENT = 1,
   CORRECT = 2
}
export type LetterResponse = {
   letter: string;
   state: LetterState;
}
export type GuessResponse = Array<LetterResponse> | ErrorResponse

async function post(url: string, payload: Object | null = null) {
   const requestInfo = {
      method: "POST",
      ...(payload && { headers: { "Content-Type": "application/json" } }),
      ...(payload && { body: JSON.stringify(payload) })
   }
   console.log({ requestInfo })
   return await fetch(url, requestInfo)
}

export async function startGame(): Promise<GameInfo> {
   const url = `https://${HOST}/api/v1/start_game/`;
   const resp = await post(url)
   return await resp.json();
}

export async function guess(payload: GuessBody): Promise<GuessResponse> {
   const url = `https://${HOST}/api/v1/guess/`;
   const resp = await post(url, payload)
   console.log("guess: ", payload)
   if (resp.ok) {
      return await resp.json();
   } else if (resp.status === 400) {
      // 400 Bad Request - if the word is the wrong length, contains non-letters, or is not in the dictionary
      console.log("Invalid Word!");
      return RESPONSE_INVALID_WORD;
   } else if (resp.status === 403) {
      // 403 Forbidden - if the game has been finished, or already has 6 guesses
      console.log("Game Over!");
      return RESPONSE_GAME_OVER;
   }
   throw Error("Unexpected Error")
}

type FinishGameResponse = {
   answer: string;
}
export async function finishGame(payload: {
   id: number,
   key: string,
}): Promise<FinishGameResponse> {
   const url = `https://${HOST}/api/v1/finish_game/`;
   const resp = await post(url, payload)
   return await resp.json();
}

const apis = { startGame, finishGame, guess }
export default apis