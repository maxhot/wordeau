import styled, { css } from "styled-components";
import { LetterState } from "../misc/types";

function state2cssColor(state: LetterState | null): string {
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

interface TileProps {
   state: LetterState | null,
   isSubmitting?: boolean,
   animationDelay?: string,
   isInvalid?: boolean,       // is this part of an word deemed invalid (not a real word)
   size?: 'm' | 'l',
   focus?: boolean,           // is this letter being focused?
}

export const LetterTile = styled.article<TileProps>`
   box-sizing: border-box;
   display: grid;
   place-items: center;

   font-weight: bold;
   font-size: x-large;

   ${props => props.focus ? css`
      outline: 2px solid hsl(0deg, 0%, 50%);
   ` : ""
   }
   ${(props => props.size === 'm'
      ? css`
      min-width: 2.5rem;
      min-height: 2.5rem;`
      : css`
      min-width: 3rem;
      min-height: 3rem;`
   )}

   color: hsl(0, 0%, 30%);
   background-color: ${(props) => state2cssColor(props.state)};

   border: 1px solid lightgrey;
   border-radius: .25rem;

   user-select: none;   /* don't let user select letters */
   ${(props) => props.isInvalid ? css`
      /* TODO: find a better way to indicate invalid word guess */
      /* opacity: 70%; */
   `: ''
   }
   ${(props) => props.isSubmitting ?
      css`
         opacity: 50%;
         animation: sway-bounce 1s infinite both;`
      : ""
   }
   ${(props) => props.animationDelay ? css`
      animation-delay: ${props.animationDelay};
   ` : ""
   }

   @keyframes sway-bounce {
      0% { transform: translateY(0); }
      25% { transform: translateY(.25rem); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-.25rem); }
      100% { transform: translateY(0); }
   }
`
