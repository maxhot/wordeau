import { LetterGuess, LetterState } from "../api"
import { LetterHints, LetterPositionHints } from "../App"

export function renderWhen(condition, component) {
   return condition ? component : null
}

// Used for Hard Mode 
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

export function isWinningGuess(guess: LetterGuess[]) {
   return guess.every(({ state }) => state === LetterState.CORRECT)
}