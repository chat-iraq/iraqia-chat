import { useCallback, useState } from 'react'
import { readJson, writeJson } from '../services/storage'

/** حالة متزامنة مع localStorage */
export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => readJson(key, fallback))

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        writeJson(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, update]
}

export default useLocalStorage