import styled from "styled-components"

const Wrapper = styled.div`
   position: fixed;
   top: 0;
   left: 0;
   width: 100vw;
   height: 100vh;
   background: white;
   /* opacity: 70%; */
   display: grid;
   place-items: center;
`

const Modal = styled.div`
   box-sizing: border-box;
   width: 20rem;
   height: 20rem;
   border: 1px solid black;
   display: grid;
   place-content: center;
   background: white;
   padding-bottom: 2rem;
`

const Button = styled.button`
   min-height: 44px;
   font-size: larger;
`
export default function GameOverModal({ newGame, answer }: {
   newGame: () => void
   answer: string | null
}) {
   return <Wrapper>
      <Modal>
         <h1>Game Over</h1>
         <h2>Answer: {answer || '???'}</h2>
         <Button onClick={newGame}>New Game</Button>
      </Modal>

   </Wrapper>
}