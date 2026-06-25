import React, { useEffect, useState } from 'react'
import TestRenderer, { act } from 'react-test-renderer'

import { useCallbackOne, useMemoOne } from '../lib/useMemoOne'

describe('useMemoOne', () => {
  it('keeps the same memoized value while inputs are equal', () => {
    const values: unknown[] = []

    const Component = ({ value }: { value: string }) => {
      const memoized = useMemoOne(() => ({ value }), [value])

      values.push(memoized)

      return null
    }

    const renderer = TestRenderer.create(<Component value="first" />)

    renderer.update(<Component value="first" />)
    renderer.update(<Component value="second" />)

    expect(values[0]).toBe(values[1])
    expect(values[1]).not.toBe(values[2])
  })

  it('keeps the same callback while inputs are equal', () => {
    const callbacks: unknown[] = []

    const Component = ({ value }: { value: string }) => {
      const callback = useCallbackOne(() => value, [value])

      callbacks.push(callback)

      return null
    }

    const renderer = TestRenderer.create(<Component value="first" />)

    renderer.update(<Component value="first" />)
    renderer.update(<Component value="second" />)

    expect(callbacks[0]).toBe(callbacks[1])
    expect(callbacks[1]).not.toBe(callbacks[2])
  })

  it('recomputes without inputs after the first committed render', () => {
    const values: unknown[] = []

    const Component = () => {
      const [count, setCount] = useState(0)
      const memoized = useMemoOne(() => ({ count }))

      values.push(memoized)

      useEffect(() => {
        if (count === 0) setCount(1)
      }, [count])

      return null
    }

    act(() => {
      TestRenderer.create(<Component />)
    })

    expect(values[0]).not.toBe(values[1])
  })
})
