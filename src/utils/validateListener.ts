import type { ModalEventAction, ModalEventName, ModalEventPayload } from '../types'

import invariant from './invariant'

const validEventNames: ModalEventName[] = ['onAnimate']

export default function (_: ModalEventAction, payload: ModalEventPayload) {
  const { eventName, handler } = payload

  invariant(eventName?.length > 0, "You didn't pass any event listener name to addListener()")
  invariant(
    validEventNames.some((name) => name === eventName),
    `'${eventName}' is not a valid event listener name. Did you mean any of these: ${validEventNames.map(
      (validName) => `\n• ${validName}`,
    )}`,
  )

  invariant(handler, "You didn't pass any handler to addListener()")
  invariant(typeof handler === 'function', 'The handler you pass to addListener() must be a function')
}
