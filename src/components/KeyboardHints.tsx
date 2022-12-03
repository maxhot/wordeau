import assert from 'tiny-invariant';
import React from 'react'
import styled, { css } from 'styled-components';
import { Delete } from 'lucide-react'

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
assert(keyboardLetterRows.length === 3, "3 rows of keys")
keyboardLetterRows[1].push("Backspace")
keyboardLetterRows[2].push("Enter")

function KeyboardHints({ buffer, letterHints, handleKey }: {
   buffer: string,
   letterHints: HintsByLetter,
   handleKey: (string) => void,
}) {
   return <Wrapper>{
      keyboardLetterRows.map((letters: string[], i) => (
         <KeyRow key={i}>
            {letters.map((letter: string, j) => {
               const label =
                  letter === 'Backspace' ? <Delete />
                     : letter === 'Enter' ? 'Enter'
                        : letter

               const disabled =
                  (letter === 'Enter' && buffer.length < 5) ||
                  (letter === 'Backspace' && buffer.length === 0)

               // Okay to use index as element key since these arrays are fixed and stable
               return <LetterTile
                  key={j} state={letterHints.get(letter) ?? null}
                  onClick={() => { !disabled && handleKey(letter) }}
                  disabled={disabled}
                  wider={letter === 'Enter'}
                  size="m"
               > {label} </LetterTile>
            })}
         </KeyRow>
      ))
   }</Wrapper>
}

export default KeyboardHints