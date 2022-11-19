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

   const [letterHints, setLetterHints] = useState<LetterHints>(new Map())
   // used only for hard mode to determine correct positions
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

   async function newGame() {
      const gameInfo = await api.startGame()
      console.log("New game started!", gameInfo)
      setGameInfo(gameInfo)

      // reset game states
      setBuffer("");
      setGuesses([]);
      setLetterHints(new Map())
      setPositionHints(new Map())
      setAnswer(null)
   }

   // We consider the game over once we have the answer
   const isGameOver = answer !== null

   // start new game immediately on mount
   useEffect(() => {
      newGame()
   }, [])

   const handleSubmitGuess = useCallback(() => {
      (async () => {
         if (!gameInfo) return
         if (isGameOver) return // disallow guess submissions after game over
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
         // BUGBUG: could fire twice on Enter Enter

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
   }, [setGuesses, buffer, gameInfo, isHardMode, letterHints, positionHints, guesses, isGameOver])


   const handleKeydown = useCallback((event) => {
      if (event.key === "Enter") {
         if (isGameOver) {
            newGame();
            return;
         }
         if (buffer.length < 5) return; // not enough characters to submit guess
         handleSubmitGuess();
      }
      if (isGameOver) return;
      if (event.key === "Backspace") {
         setBuffer((buffer) => buffer.slice(0, -1));
      } else if (event.key >= "a" && event.key <= "z") {
         // if already guessed all 5 chars then do nothing
         if (buffer.length >= 5) return;
         setBuffer((buffer) => buffer + event.key);
      }
   }, [isGameOver, handleSubmitGuess, setBuffer, buffer.length])

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