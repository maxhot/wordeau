import { useEffect } from 'react'

export function useGlobalKeyHandler(handler: (e: KeyboardEvent) => void) {
   useEffect(() => {
      window.addEventListener("keydown", handler);
      return () => {
         window.removeEventListener("keydown", handler);
      };
   }, [handler]);
}