import { useEffect, useRef, useState } from 'react'

type Cache<T> = {
  inputs?: readonly unknown[]
  result: T
}

const areInputsEqual = (newInputs: readonly unknown[], lastInputs: readonly unknown[]) => {
  if (newInputs.length !== lastInputs.length) return false

  for (let i = 0; i < newInputs.length; i += 1) {
    if (newInputs[i] !== lastInputs[i]) return false
  }

  return true
}

export function useMemoOne<T>(getResult: () => T, inputs?: readonly unknown[]): T {
  const initial = useState<Cache<T>>(() => ({
    inputs,
    result: getResult(),
  }))[0]

  const isFirstRun = useRef(true)
  const committed = useRef(initial)

  const useCache =
    isFirstRun.current ||
    Boolean(inputs && committed.current.inputs && areInputsEqual(inputs, committed.current.inputs))

  const cache = useCache
    ? committed.current
    : {
        inputs,
        result: getResult(),
      }

  useEffect(() => {
    isFirstRun.current = false
    committed.current = cache
  }, [cache])

  return cache.result
}

export function useCallbackOne<T extends (...args: any[]) => any>(callback: T, inputs?: readonly unknown[]): T {
  return useMemoOne(() => callback, inputs)
}

export const useMemo = useMemoOne
export const useCallback = useCallbackOne
