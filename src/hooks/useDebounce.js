import { useState, useEffect } from 'react'

// Generic debounce hook. Used by the Profile screen so that editing a field
// doesn't trigger a database write on every keystroke (Risk 12) — it waits
// for the user to stop typing for `delay` ms before the debounced value updates.
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}