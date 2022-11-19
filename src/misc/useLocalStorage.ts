import React, { Dispatch, SetStateAction } from "react";
import assert from 'tiny-invariant'

type SetValue<T> = Dispatch<SetStateAction<T>>

/**
 * Only support default values, not default value functions
 * source: https://designcode.io/react-hooks-handbook-uselocalstorage-hook
 */
export default function useLocalStorage<T>(key, defaultValue: T): [T, SetValue<T>] {
   assert(typeof defaultValue !== 'function', "instantiation functions not supported")

   const [value, setValue] = React.useState<T>(() => {
      let currValue;
      try {
         currValue = JSON.parse(window.localStorage.getItem(key) || String(defaultValue))
      } catch {
         currValue = defaultValue
      }
      return currValue
   })

   React.useEffect(() => {
      window.localStorage.setItem(key, JSON.stringify(value))
   }, [key, value])

   return [value, setValue]
}
