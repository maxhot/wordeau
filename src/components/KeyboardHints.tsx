import React from 'react'
import styled from 'styled-components';
import { LetterState } from '../api';
import { HintsByLetter } from '../App';


export function state2cssColor(state: LetterState | null): string {
   switch (state) {
      case LetterState.ABSENT:
         return "grey";
      case LetterState.PRESENT:
         return "goldenrod";
      case LetterState.CORRECT:
         return "lightgreen";
      default:
         return "inherit"
   }
}

export const LetterTile = React.memo(styled.article`
   box-sizing: border-box;
   display: grid;
   place-items: center;

   font-weight: bold;
   font-size: xx-large;
   background-color: ${(props: { state: LetterState | null }) => state2cssColor(props.state)};

   border: 1px solid lightgrey;
   border-radius: .25rem;

   min-width: 3rem;
   min-height: 3rem;
   color: hsl(0, 0%, 30%);
`)

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

function KeyboardHints({ letterHints }: { letterHints: HintsByLetter }) {
   return <Wrapper>{
      keyboardLetterRows.map((letters: string[], i) => (
         <KeyRow key={i}>
            {letters.map((letter: string, j) => (
               <LetterTile key={letter} state={letterHints.get(letter) ?? null}> {letter} </LetterTile>
            ))}
         </KeyRow>
      ))
   }</Wrapper>
}

export default KeyboardHints