import styled from 'styled-components'
import { LetterResponse } from '../api'
import { KeyRow, LetterTile } from './KeyboardHints'

// Empty 6 x 5 tiles
const emptyBoard = Array(6).fill(null).map(row => Array(5).fill(null))

const Wrapper = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: .5rem; 
   margin: 2rem 0
`
function GuessBoard({ guesses, buffer }: {
   guesses: LetterResponse[][], buffer: string
}) {
   return <Wrapper>{
      emptyBoard.map((rowTiles, rowIdx) => {
         return <KeyRow key={rowIdx}> {
            rowTiles.map((tile, j) => {
               if (rowIdx < guesses.length) { // render previous guess
                  const letterGuess = guesses[rowIdx][j]
                  return (
                     <LetterTile key={j} state={letterGuess.state} >
                        {letterGuess.letter}
                     </LetterTile>
                  )
               } else if (rowIdx === guesses.length) { // render current buffer
                  const letter = buffer[j]
                  return (
                     <LetterTile key={j} state={null}>
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