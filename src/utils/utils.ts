import { LetterResponse, LetterState } from "../api"
import { LetterHints, LetterPositionHints } from "../App"

export function renderWhen(condition, component) {
   return condition ? component : null
}

// used for Hard Mode
export function missingHintLetters(
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
      // we COULD count CORRECT letters here but it's more precise to use a different kind of map (see below)
   })

   // count correct letters
   positionHints.forEach((letter, idx) => {
      if (buffer[idx] !== letter) {
         missingLetters.push(letter)
      }
   })
   return missingLetters;
}

export function isWinningGuess(guess: LetterResponse[]) {
   return guess.every(({ state }) => state === LetterState.CORRECT)
}