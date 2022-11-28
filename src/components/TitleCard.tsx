import styled, { css } from 'styled-components'

export type GameInfoSource = 'localStorage' | 'newGame'

const Title = styled.h1`
   color: hsl(0, 0%, 20%);
`

const AnimatedGameId = styled.span<{ source: GameInfoSource }>`
   display: inline-block;
   /* display: block; */
	${props => props.source === 'newGame'
      ? css`animation: rollInBlurredBottom 0.6s cubic-bezier(0.230, 1.000, 0.320, 1.000) both;`
      : css`animation: roll-in-blurred-left 0.65s cubic-bezier(0.230, 1.000, 0.320, 1.000) both;`
   }

   /* ----------------------------------------------
   * Generated by Animista on 2022-11-23 14:43:12
   * Licensed under FreeBSD License.
   * See http://animista.net/license for more info. 
   * w: http://animista.net, t: @cssanimista
   * ---------------------------------------------- */

   @keyframes roll-in-blurred-left {
      0% {
         transform: translateX(-1000px) rotate(-720deg);
         filter: blur(50px);
         opacity: 0;
      }
      100% {
         transform: translateX(0) rotate(0deg);
         filter: blur(0);
         opacity: 1;
      }
   }
   @keyframes rollInBlurredBottom {
      0% {
         transform: translateY(800px) rotate(720deg);
         filter: blur(50px);
         opacity: 0;
      }
      100% {
         transform: translateY(0) rotate(0deg);
         opacity: 1;
      }
   }
`

export function TitleCard({ id, source = 'newGame' }: { id: number, source: GameInfoSource }) {

   return (
      <Title>
         Wordeau
         &nbsp;
         {/* Change key on each new game to force remount in order to re-trigger the animation */}
         <AnimatedGameId {...{ source }} key={id}>
            #{id}
         </AnimatedGameId>
      </Title>
   )
}