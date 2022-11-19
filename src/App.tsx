import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import styled, { createGlobalStyle } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useLocalStorage from './misc/useLocalStorage';
import assert from 'tiny-invariant'

import { useGlobalKeyHandler } from './misc/useGlobalKeyHandler';
import { isWinningGuess, unusedHintLetters, renderWhen, } from './misc/misc';
import api, { LetterGuess, ResponseError, GameInfo, LetterState } from "./api"
import GuessBoard from './components/GuessBoard';
import KeyboardHints from './components/KeyboardHints';
import GameOverModal from './components/GameOverModal';
import { DifficultySelection } from './components/DifficultySelection';

export type HintsByLetter = Map<string, LetterState>
export type HintsByCorrectPosition = Map<number, string>

const VERSION = "0.1.2"
const WORD_LEN = 5;
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

function storeKey(key: string) {
   return `${STORAGE_KEY}:${key}`
}

/**
 * Wordeau Game Main app
 */
function App() {
   /**
    * States we want to persist across sessions:
    * - gameInfo - this lets us continue a game we started earlier
    * - guesses - ditto
    * - answer - lets us continue from end game
    * - isHardMode - save our difficulty preference across sessions
    */
   const [gameInfo, setLocalGameInfo] = useLocalStorage<GameInfo | null>(storeKey("gameInfo"), null)
   const [guesses, setLocalGuesses] = useLocalStorage<LetterGuess[][]>(storeKey("guesses"), []);
   const [answer, setLocalAnswer] = useLocalStorage<string | null>(storeKey("answer"), null)
   const [isHardMode, setIsHardMode] = useLocalStorage<boolean>(storeKey("isHardMode"), true);

   const [buffer, setBuffer] = useState("");
   const resetStates = useCallback(() => {
      // reset game states
      setBuffer("");
      setLocalGuesses([]);
      setLocalAnswer(null)
   }, [setLocalAnswer, setLocalGuesses])

   /**
    * Resets game state and starts a new game
    */
   const resetNewGame = useCallback(() => {
      (async function () {
         const gameInfo = await api.startGame()
         console.log("New game started!", gameInfo)

         resetStates();
         setLocalGameInfo(gameInfo)
      })()
   }, [resetStates, setLocalGameInfo])


   // Prove state is what we expect
   assert(Array.isArray(guesses), "guesses should always be an array")
   assert(answer === null || typeof answer === 'string', "Answer shud be null or string")

   // Derive hints from guesses
   const [letterHints, positionHints]: [HintsByLetter, HintsByCorrectPosition] = useMemo(() => {
      const letterHints: HintsByLetter = new Map();
      const positionHints: HintsByCorrectPosition = new Map();
      guesses.forEach((guess) => {
         guess.forEach(({ letter, state }, idx) => {
            if (state > (letterHints.get(letter) ?? -1))
               letterHints.set(letter, state) // prevent downgrading of hints (e.g. 2 -> 1 is not allowed)

            if (state === LetterState.CORRECT)
               positionHints.set(idx, letter)
         })
      })
      return [letterHints, positionHints]
   }, [guesses])

   // use counter as mutex to prevent multiple simultaneous API calls
   // (e.g. without this we may allow user to submit multiple guesses before 
   // get a single response)
   // this could be a custom hook useRefCounter
   const apiCallCounterRef = useRef(0)
   const incrementCounter = () => { apiCallCounterRef.current += 1 }
   const decrementCounter = () => { apiCallCounterRef.current -= 1 }
   const getApiCallCount = () => apiCallCounterRef.current

   // Start new game immediately on mount if no game in progress
   useEffect(() => {
      if (!gameInfo)
         resetNewGame()
      // ^ should not run more than once per game since our only dependency (newGame) is constant
   }, [gameInfo, resetNewGame])

   let isGameOver = answer !== null

   const handleSubmitGuess = useCallback((buffer: string) => {
      (async function () {
         if (!gameInfo) return
         if (getApiCallCount() > 0) {
            console.warn("Submission Blocked")
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

         incrementCounter()
         try {
            const guessResponse = await api.guess({
               id: gameInfo.id,
               key: gameInfo.key,
               guess: buffer
            })
            if (guessResponse === ResponseError.INVALID_WORD) {
               toast.error("Invalid Word!")
               return
            } else if (guessResponse === ResponseError.GAME_OVER) {
               toast.error("Game Already Over")
               // override game over state
               setLocalAnswer("BUGBUG");
               return
            }

            // clear buffer after each guess
            setBuffer("")

            setLocalGuesses((guesses) => [...guesses, guessResponse]);

            // Is the game over?
            if (isWinningGuess(guessResponse)) {
               setLocalAnswer(guessResponse.map(({ letter }) => letter).join(""))
            }
            else if (guesses.length === 5) {
               // out of guesses; fetch answer
               const { answer } = await api.finishGame({ id: gameInfo.id, key: gameInfo.key })
               setLocalAnswer(answer)
            }
         } finally {
            decrementCounter()
         }
      })()
   }, [gameInfo, guesses.length, isHardMode, letterHints, positionHints, setLocalAnswer, setLocalGuesses])

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

   return renderWhen(gameInfo,
      (<div className="App">
         <Title>Wordeau #{gameInfo?.id}</Title>
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