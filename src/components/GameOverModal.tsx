import styled from "styled-components"

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
`

const Modal = styled.div`
   box-sizing: border-box;
   width: 20rem;
   height: 20rem;
   border: 2px solid grey;
   display: grid;
   place-content: center;
   background: white;
   padding-bottom: 2rem;
   border-radius: 1rem;
`

const Button = styled.button`
   min-height: 44px;
   font-size: larger;
`

const Answer = styled.span`
   color: green;
`
export default function GameOverModal({ newGame, answer }: {
   newGame: () => void
   answer: string | null
}) {
   return <Wrapper>
      <Modal>
         <h1>Game Over</h1>
         <h2>Answer: <Answer>{answer || '???'}</Answer></h2>
         <Button onClick={newGame}>New Game</Button>
      </Modal>

   </Wrapper>
}