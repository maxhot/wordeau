import { useState, useEffect, useCallback, useRef } from 'react';

import styled, { createGlobalStyle } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useGlobalKeyHandler } from './misc/useGlobalKeyHandler';
import { isWinningGuess, unusedHintLetters, renderWhen, } from './misc/misc';
import api, { LetterGuess, ResponseError, GameInfo, LetterState } from "./api"
import GuessBoard from './components/GuessBoard';
import KeyboardHints from './components/KeyboardHints';
import GameOverModal from './components/GameOverModal';
import { DifficultySelection } from './components/DifficultySelection';

export type LetterHints = Map<string, LetterState>
export type LetterPositionHints = Map<number, string>

const WORD_LEN = 5;

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


/**
 * Wordeau Game Main app
 */
function App() {
   const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
   const [buffer, setBuffer] = useState("");
   const [guesses, setGuesses] = useState<LetterGuess[][]>([]);

   // Used to show hints in keyboard layout
   const [letterHints, setLetterHints] = useState<LetterHints>(new Map())

   // Used for hard mode to determine correct positions:
   const [positionHints, setPositionHints] = useState<LetterPositionHints>(new Map())
   const [answer, setAnswer] = useState<string | null>(null)

   const [isHardMode, setIsHardMode] = useState(true);

   // use counter as mutex to prevent multiple simultaneous API calls
   // (e.g. without this we may allow user to submit multiple guesses before 
   // get a single response)
   // this could be a custom hook useRefCounter
   const apiCallCounterRef = useRef(0)
   const incrementCounter = () => { apiCallCounterRef.current += 1 }
   const decrementCounter = () => { apiCallCounterRef.current -= 1 }
   const getApiCallCount = () => apiCallCounterRef.current

   /**
    * Resets game state and starts a new game
    */
   const newGame = useCallback(() => {
      (async function () {
         const gameInfo = await api.startGame()
         console.log("New game started!", gameInfo)
         setGameInfo(gameInfo)

         // reset game states
         setBuffer("");
         setGuesses([]);
         setLetterHints(new Map())
         setPositionHints(new Map())
         setAnswer(null)
      })()
   }, [])

   // Start new game immediately on mount
   useEffect(() => {
      newGame()
      // ^ should not run more than once per game since our only dependency (newGame) is constant
   }, [newGame])

   const isGameOver = answer !== null

   const handleSubmitGuess = useCallback((buffer: string) => {
      (async function () {
         if (!gameInfo) return
         if (getApiCallCount() > 0) {
            console.warn("Submission Blocked")
            return // block submissions when one is already in progress
         }

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
               return
            }

            // clear buffer after each guess
            setBuffer("")

            // update hints
            setLetterHints(letterHints => {
               const newLetterHints = new Map(letterHints)
               guessResponse.forEach(({ letter, state }) => {
                  if (state > (newLetterHints.get(letter) ?? -1))
                     newLetterHints.set(letter, state) // no downgrading of hints (e.g. 2 -> 1 is not allowed)
               })
               return newLetterHints
            })
            setPositionHints(positionHints => {
               const newHints = new Map(positionHints)
               guessResponse.forEach(({ letter, state }, idx) => {
                  if (state === LetterState.CORRECT)
                     newHints.set(idx, letter)
               })
               return newHints
            })

            setGuesses((guesses) => [...guesses, guessResponse]);

            // Is the game over?
            if (isWinningGuess(guessResponse)) {
               setAnswer(guessResponse.map(({ letter }) => letter).join(""))
            }
            else if (guesses.length === 5) {
               // out of guesses; fetch answer
               const { answer } = await api.finishGame({ id: gameInfo.id, key: gameInfo.key })
               setAnswer(answer)
            }
         } finally {
            decrementCounter()
         }
      })()
   }, [gameInfo, guesses.length, isHardMode, letterHints, positionHints])

   const handleKeydown = useCallback((event) => {
      if (isGameOver) {
         if (event.key === 'Enter') {
            newGame();
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
   }, [isGameOver, buffer, handleSubmitGuess, newGame])

   useGlobalKeyHandler(handleKeydown)

   return renderWhen(gameInfo,
      (<div className="App">
         <Title>Wordeau #{gameInfo?.id}</Title>
         <DifficultySelection {...{ isHardMode, setIsHardMode }} />
         <GuessBoard {...{ guesses, buffer }} />
         <KeyboardHints {...{ letterHints }} />
         {renderWhen(isGameOver,
            <GameOverModal {...{ newGame, answer }} />
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