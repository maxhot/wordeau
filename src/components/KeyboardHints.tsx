import React from 'react'
import styled from 'styled-components';

import { HintsByLetter } from '../misc/types';
import { LetterTile } from './LetterTile';

export const KeyRow = React.memo(styled.div`
display: flex;
flex-direction: row;
gap: .5rem;
`)

const Wrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
gap: .5rem;
`

const keyboardLetterRows: string[][] = ["qwertyuiop", "asdfghjkl", "zxcvbnm"].map(letters => letters.split(""))

function KeyboardHints({ letterHints, handleKey }: {
   letterHints: HintsByLetter,
   handleKey: (string) => void,
}) {
   return <Wrapper>{
      keyboardLetterRows.map((letters: string[], i) => (
         <KeyRow key={i}>
            {letters.map((letter: string, j) => (

               // while it's usually frowned upon to use index number as key, in this case we know the index is guaranteed to be unique because the keyboard is hard-coded and fixed 
               <LetterTile
                  key={j} state={letterHints.get(letter) ?? null}
                  onClick={() => handleKey(letter)}
                  size="m"
               > {letter} </LetterTile>
            ))}
         </KeyRow>
      ))
   }</Wrapper>
}

export default KeyboardHints