

/**
 * @usage
 * 
 * const mutex = useMutex()
 * ...
 * 
 * // check lock
 * if (mutex.locked()) return
 * mutex.runProtected(async () => {
 *    // code that locks before and unlocks after running
 *    logic that runs in callback
 * })
 * 
 * ...
 * // explicitly lock/unlock
 * mutex.lock()
 * mutex.unlock()
 * 
 */

import React from "react"

class Mutex {
   counter: number = 0
   isLocked() {
      return this.counter > 0
   }
   lock() {
      this.counter += 1
   }
   unlock() {
      this.counter -= 1
   }
   /**
    * 
    * @param fn async function, around which we lock the mutex so that only one can run at a time
    */
   async runProtected(fn) {
      this.lock();
      try {
         await fn()
      }
      finally {
         this.unlock();
      }
   }
}

export function useMutex() {
   const mutexRef = React.useRef(new Mutex())

   return mutexRef.current
}