import styled, { keyframes } from "styled-components"

import { required } from "../misc/misc"

const fadeIn = keyframes`
   from {
      opacity: 0%;
      @supports (backdrop-filter: blur(8px)) { 
         backdrop-filter: blur(0);
      }
   }
   to {
      opacity: 100%;
      @supports (backdrop-filter: blur(8px)) { 
         backdrop-filter: blur(6px);
      }
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

   animation: ${fadeIn} .5s ease-out both;
`

const ModalPane = styled.div`
   box-sizing: border-box;
   display: grid;
   place-content: center;
   width: 20rem;
   height: 20rem;
   border: 2px solid grey;
   border-radius: 1rem;
   background: white;
   padding-bottom: 2rem;

   /* TODO: animate appearance of this modal */

`
const Button = styled.button`
   min-height: 44px;
   font-size: larger;
`
const Answer = styled.span`
   color: green;
`

const LighterText = styled.span`
   opacity: 40%;
`

export default function GameOverModal({ newGame, answer = (required() as any) }: {
   newGame: () => void
   answer: string | null
}) {
   return <Wrapper>
      <ModalPane>
         <h1>Game Over</h1>

         <h2>Answer: <Answer>{answer}</Answer></h2>
         <h3>
            <a href={`https://duckduckgo.com/?q=define+${answer}`}>Learn more about "<Answer>{answer}</Answer>"</a>
         </h3>
         <Button onClick={() => newGame()}>New Game <LighterText>[Enter]</LighterText></Button>
      </ModalPane>
   </Wrapper>
}