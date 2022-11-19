import { ReactElement } from "react"
import { LetterGuess, LetterState } from "../api"
import { LetterHints, LetterPositionHints } from "../App"

export function renderWhen(condition: unknown, component: ReactElement) {
   return condition ? component : null
}

export function required() {
   console.error("Required argument not provided.")
}


/** 
 * For Hard Mode we force the user to use all hinted letters in the each guess.
 * This means 1) all letters with known positions must be submitted in the
 * known position for subsequent guesses, and 2) all letters that are present
 * in the answer but not yet in the correct position are also included in
 * the guess.
 */
// TODO: consider move to file `gameLogic.ts` OR `hardMode.ts`
export function unusedHintLetters(
   buffer: string,
   letterHints: LetterHints,
   positionHints: LetterPositionHints,
): string[] {
   const missingLetters: string[] = []
   // count present letters
   letterHints.forEach((state, letter) => {
      if (state === LetterState.PRESENT && buffer.indexOf(letter) === -1) {
         missingLetters.push(letter)
      }
   })
   // count correct letters
   positionHints.forEach((letter, idx) => {
      if (buffer[idx] !== letter) {
         missingLetters.push(letter)
      }
   })
   return missingLetters;
}

// TODO: move to gameLogic.ts
export function isWinningGuess(guess: LetterGuess[]) {
   return guess.every(({ state }) => state === LetterState.CORRECT)
}