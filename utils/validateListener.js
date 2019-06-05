/* @flow */

import type { EventName } from '../types'
import invariant from './invariant'

type Action = 'add'

type Payload = {
  eventName: EventName,
  handler: () => void,
}

const validEventNames = ['onAnimate']

export default function(action: Action, payload: Payload) {
  const { eventName, handler } = payload

  invariant(
    eventName?.length > 0,
    "You didn't pass any event listener name to addListener()"
  )
  invariant(
    validEventNames.some(name => name === eventName),
    // $FlowFixMe
    `'${eventName}' is not a valid event listener name. Did you mean any of these: ${validEventNames.map(
      validName => `\n• ${validName}`
    )}`
  )

  invariant(handler, "You didn't pass any handler to addListener()")
  invariant(
    typeof handler === 'function',
    'The handler you pass to addListener() must be a function'
  )
}
