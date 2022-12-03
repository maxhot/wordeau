import styled from 'styled-components'
import { LetterGuess } from '../misc/types'
import { KeyRow } from './KeyboardHints'
import { LetterTile } from './LetterTile'

// Empty 6 x 5 tiles
const emptyBoard = Array(6).fill(null).map(row => Array(5).fill(null))

const Wrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: .5rem; 
   margin: 1.5rem 0;
`
function GuessBoard({ guesses, buffer, isSubmitting, isInvalidGuess }: {
   guesses: LetterGuess[][],
   buffer: string,
   isSubmitting: boolean,
   isInvalidGuess?: boolean,
}) {
   return <Wrapper>{
      emptyBoard.map((rowTiles, rowIdx) => {
         return <KeyRow key={rowIdx}> {
            rowTiles.map((tile, j) => {
               if (rowIdx < guesses.length) { // render previous guess
                  const letterGuess = guesses[rowIdx][j]
                  return (
                     <LetterTile key={j}
                        state={letterGuess.state}
                     >
                        {letterGuess.letter}
                     </LetterTile>
                  )
               } else if (rowIdx === guesses.length) { // render current guess buffer
                  const letter = buffer[j]

                  // stagger "bounce of each letter" when we're guessing
                  const animationDelay = (j * .25) + 's'
                  return (
                     <LetterTile key={j} state={null}
                        isSubmitting={isSubmitting}
                        animationDelay={animationDelay}
                        // outline current letter or last letter
                        focus={j === buffer.length || (j === 4 && buffer.length === 5)}
                     >
                        {letter ?? ""}
                     </LetterTile>
                  )
               } else { // render blank tiles
                  return (
                     <LetterTile key={j} state={null}>
                        {""}
                     </LetterTile>
                  )
               }
            })
         }</KeyRow>
      })
   }</Wrapper >

}

export default GuessBoard