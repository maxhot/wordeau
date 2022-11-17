import React, { useState, useEffect, useCallback } from 'react';

// 3rd party
import styled, { createGlobalStyle } from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';
import { useGlobalKeyHandler } from './useGlobalKeyHandler';
import { isWinningGuess, missingHintLetters, renderWhen, } from './utils/utils';
import api, { LetterResponse, ErrorResponse, GameInfo, LetterState } from "./api"
import GuessBoard from './components/GuessBoard';
import KeyboardHints from './components/KeyboardHints';
import GameOverModal from './components/GameOverModal';
import { DifficultySelection } from './components/DifficultySelection';

export type LetterHints = Map<string, LetterState>
export type LetterPositionHints = Map<number, string>

const GlobalStyles = createGlobalStyle`
   body {
      background-color: ${(props: { isHardMode: boolean }) => props.isHardMode ? "hsl(0, 0%, 90%)" : "white"} 
   }
`

function App() {
   const [gameInfo, setGameInfo] = useState<GameInfo | null>(null)
   const [buffer, setBuffer] = useState("");
   const [guesses, setGuesses] = useState<LetterResponse[][]>([]);
   const [letterHints, setLetterHints] = useState<LetterHints>(new Map()) // letter hints
   const [positionHints, setPositionHints] = useState<LetterPositionHints>(new Map()) // letter hints
   const [answer, setAnswer] = useState<string | null>(null)

   const [isHardMode, setIsHardMode] = useState(true);

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

   // game over if 1) 6 guesses have been made or 2) last guess had all correct
   const isGameOver = React.useMemo(() => {
      // Even if we have 6 guesses, we don't want to show the game over screen until we get the answer from the server
      // if (guesses.length === 6) return true;
      if (answer) return true
      if (guesses.length > 0) {
         return isWinningGuess(guesses[guesses.length - 1])
      }
      return false
   }, [guesses, answer])

   useEffect(() => {
      newGame()
   }, [])

   const handleSubmitGuess = useCallback(() => {
      (async () => {
         if (!gameInfo) return
         if (isGameOver) return // disallow guess submissions after game over
         // TODO: add waiting state
         if (isHardMode) {
            const missingLetters = missingHintLetters(buffer, letterHints, positionHints)
            if (missingLetters.length > 0) {
               toast.error(`Missing Letters: (${missingLetters.join(", ")})`, {
                  autoClose: 3000,
               })
               return
            }
         }
         const guessResponse = await api.guess({
            id: gameInfo.id,
            key: gameInfo.key,
            guess: buffer
         })
         if (guessResponse === ErrorResponse.InvalidWord) {
            toast.error("Invalid Word!")
            return
         } else if (guessResponse === ErrorResponse.GameOver) {
            toast.error("Game Already Over")
            return
         }

         // setGuesses(guesses => ([...guesses, (guessResponse as LetterResponse[])]))
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

         // update position hints
         setPositionHints(positionHints => {
            const newHints = new Map(positionHints)
            guessResponse.forEach(({ letter, state }, idx) => {
               if (state === LetterState.CORRECT)
                  newHints.set(idx, letter)
            })
            return newHints
         })

         setGuesses((guesses) => [...guesses, guessResponse]);

         if (isWinningGuess(guessResponse)) {
            setAnswer(guessResponse.map(({ letter }) => letter).join(""))
         }
         else if (guesses.length === 5) {
            // out of guesses; fetch answer
            const { answer } = await api.finishGame({ id: gameInfo.id, key: gameInfo.key })
            setAnswer(answer)
         }
      })()
   }, [setGuesses, buffer, gameInfo, isHardMode, letterHints, positionHints, guesses, isGameOver])


   const handleKeydown = useCallback((event) => {
      if (isGameOver) return;
      if (event.key === "Enter") {
         if (buffer.length < 5) return; // not enough characters to submit guess

         handleSubmitGuess();
      }
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

const Title = styled.h1`
   color: hsl(0, 0%, 20%);
`


export default App;
