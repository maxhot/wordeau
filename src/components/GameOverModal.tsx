import styled, { keyframes } from "styled-components"

import { required } from "../misc/misc"

const fadeIn = keyframes`
   from {
      opacity: 0%
   }
   to {
      opacity: 100%;
   }
`
const Wrapper = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   width: 100vw;
   height: 100vh;
   display: grid;
   place-items: center;

   background: hsla(0deg, 0%, 100%, 0.9 );
   @supports (backdrop-filter: blur(8px)) {
      background: hsla(0deg, 0%, 100%, 0.6);
      backdrop-filter: blur(6px); 
   }

   animation: ${fadeIn} 2s both;
`

const Modal = styled.div`
   box-sizing: border-box;
   display: grid;
   place-content: center;
   width: 20rem;
   height: 20rem;
   border: 2px solid grey;
   border-radius: 1rem;
   background: white;
   padding-bottom: 2rem;
`
const Button = styled.button`
   min-height: 44px;
   font-size: larger;
`
const Answer = styled.span`
   color: green;
`

export default function GameOverModal({ newGame, answer = (required() as any) }: {
   newGame: () => void
   answer: string | null
}) {
   return <Wrapper>
      <Modal>
         <h1>Game Over</h1>

         <h2>Answer: <Answer>{answer || 'Unknown'}</Answer></h2>
         <Button onClick={() => newGame()}>New Game [Enter]</Button>
      </Modal>
   </Wrapper>
}