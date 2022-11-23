import { useState, useEffect, useCallback, useMemo } from 'react';

import { createGlobalStyle } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useLocalStorage from './misc/useLocalStorage';
import assert from 'tiny-invariant'

import { useGlobalKeyHandler } from './misc/useGlobalKeyHandler';
import { isWinningGuess, unusedHintLetters, renderWhen, } from './misc/misc';
import api from "./api"
import GuessBoard from './components/GuessBoard';
import KeyboardHints from './components/KeyboardHints';
import GameOverModal from './components/GameOverModal';
import { DifficultySelection } from './components/DifficultySelection';
import { useMutex } from './misc/useMutex';
import { GameIdKeys, HintsByCorrectPosition, HintsByLetter, LetterGuess, LetterState, ResponseError } from './misc/types';
import { GameInfoSource, TitleCard } from './components/TitleCard';

const VERSION = "0.1.3"
const WORD_LEN = 5;
// local storage key
const STORAGE_KEY = `wordeau--${VERSION}`

const GlobalStyles = createGlobalStyle`
   body {
      /* background color to indicate hard mode */
      background-color: ${(props: { isHardMode: boolean }) => props.isHardMode ? "hsl(0, 0%, 90%)" : "white"} ;
      text-align: center;
   }
`
const Title = styled.h1`
   color: hsl(0, 0%, 20%);
`

function localKey(key: string) {
   return `${STORAGE_KEY}:${key}`
}

/**
 * Wordeau Game Main app
 */
function App() {
   // These states persist across sessions:
   const [gameIdKeys, setGameIdKeys] = useLocalStorage<GameIdKeys | null>(localKey("gameIdKeys"), null)
   const [guesses, setGuesses] = useLocalStorage<LetterGuess[][]>(localKey("guesses"), []);
   const [answer, setAnswers] = useLocalStorage<string | null>(localKey("answer"), null)
   const [isHardMode, setIsHardMode] = useLocalStorage<boolean>(localKey("isHardMode"), true);

   // These states DO NOT persist across sessions
   const [gameSource, setGameSource] = useState<GameInfoSource>('localStorage')
   const [buffer, setBuffer] = useState("");
   // Prevent multiple simultaneous API calls with a semaphore
   const mutex = useMutex()

   // Resets game state and starts a new game
   const resetNewGame = useCallback(() => {
      (async function () {
         const gameInfo = await api.startGame()
         console.log("New game started!", gameInfo)

         // reset game states
         setBuffer("");
         setGuesses([]);
         setAnswers(null)
         setGameSource('newGame')

         setGameIdKeys(gameInfo)
      })()
   }, [setAnswers, setGameIdKeys, setGuesses]) // these should all be constant through the life of this component

   // Start new game if no existing game in progress
   useEffect(() => {
      if (!gameIdKeys)
         resetNewGame()
   }, [gameIdKeys, resetNewGame])

   // prove assumptions
   assert(Array.isArray(guesses), "Guesses should always be an Array...")
   assert(answer === null || typeof answer === 'string', "Answer shud be null or string")

   // Derive all hints from guesses so far
   const [letterHints, positionHints]: [HintsByLetter, HintsByCorrectPosition] = useMemo(() => {
      const letterHints: HintsByLetter = new Map();
      const positionHints: HintsByCorrectPosition = new Map();

      guesses.forEach((guess) => {
         guess.forEach(({ letter, state }, idx) => {
            // find the best hint for each letter
            if (state > (letterHints.get(letter) ?? -1
               // Default to -1 just so state of 0 has something to be greater than
               // Keep only the strongest hint per letter. I.e. we should prevent downgrading of hints (e.g. if user gets 2 (CORRECT) first but then guesses the same letter and gets a 1 (PRESENT), we keep only the 2 because it's the stronger hint
            ))
               letterHints.set(letter, state)

            // collect all known correct letter positions
            if (state === LetterState.CORRECT)
               positionHints.set(idx, letter)
         })
      })
      return [letterHints, positionHints]
   }, [guesses])


   let isGameOver = answer !== null

   const handleSubmitGuess = useCallback((buffer: string) => {
      (async function () {
         if (!gameIdKeys) return
         if (mutex.isLocked()) {
            console.warn("A submission is already in progress. Blocking...")
            return // block submissions when one is already in progress
         }

         // block submission if missing unused hints (hard mode)
         if (isHardMode) {
            const missingLetters = unusedHintLetters(buffer, letterHints, positionHints)
            if (missingLetters.length > 0) {
               toast.error(`Missing Letters: (${missingLetters.join(", ")})`, {
                  autoClose: 3000,
               })
               return
            }
         }

         mutex.runProtected(async () => {
            const guessResponse = await api.guess({
               id: gameIdKeys.id,
               key: gameIdKeys.key,
               guess: buffer
            })
            if (guessResponse === ResponseError.INVALID_WORD) {
               toast.error("Invalid Word!")
               return
            } else if (guessResponse === ResponseError.GAME_OVER) {
               toast.error("Game Already Over")
               // override game over state
               setAnswers("BUGBUG");
               return
            }

            // clear buffer after each guess
            setBuffer("")

            setGuesses((guesses) => [...guesses, guessResponse]);

            // Is the game over?
            if (isWinningGuess(guessResponse)) {
               setAnswers(guessResponse.map(({ letter }) => letter).join(""))
            }
            else if (guesses.length === 5) {
               // out of guesses; fetch answer
               const { answer } = await api.finishGame({ id: gameIdKeys.id, key: gameIdKeys.key })
               setAnswers(answer)
            }
         })
      })()
   }, [gameIdKeys, guesses.length, isHardMode, letterHints, mutex, positionHints, setAnswers, setGuesses])

   const handleKeydown = useCallback((event) => {
      if (isGameOver) {
         if (event.key === 'Enter') {
            resetNewGame();
         }
         return;
      }
      else if (event.key === "Enter" && buffer.length === WORD_LEN) {
         handleSubmitGuess(buffer);
      }
      else if (event.key === "Backspace" && buffer.length > 0) {
         setBuffer((buffer) => buffer.slice(0, -1));
      }
      else if (event.key >= "a" && event.key <= "z" && buffer.length < WORD_LEN) {
         setBuffer((buffer) => buffer + event.key);
      }
   }, [isGameOver, buffer, handleSubmitGuess, resetNewGame])

   useGlobalKeyHandler(handleKeydown)

   return renderWhen(gameIdKeys,
      (<div className="App">
         <TitleCard {...{ id: gameIdKeys?.id || 0, source: gameSource }} />
         <DifficultySelection {...{ isHardMode, setIsHardMode }} />
         <GuessBoard {...{ guesses, buffer }} />
         <KeyboardHints {...{ letterHints }} />
         {renderWhen(isGameOver,
            (<GameOverModal {...{ newGame: resetNewGame, answer }} />)
         )}
         < ToastContainer
            position="top-center" autoClose={1000}
            hideProgressBar
         />
         <GlobalStyles isHardMode={isHardMode} />
      </div>)
   );
}

export default App;