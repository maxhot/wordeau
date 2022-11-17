import { useEffect } from 'react'

export function useGlobalKeyHandler(handler) {
   useEffect(() => {
      window.addEventListener("keydown", handler);
      return () => {
         window.removeEventListener("keydown", handler);
      };
   }, [handler]);
}