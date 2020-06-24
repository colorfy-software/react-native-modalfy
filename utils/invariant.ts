// s/o https://www.npmjs.com/package/ts-invariant
/* eslint-disable no-proto */

const genericMessage = 'Invariant Violation'
const {
  setPrototypeOf = function (obj: any, proto: any) {
    obj.__proto__ = proto
    return obj
  },
} = Object as any

export class InvariantError extends Error {
  framesToPop = 1
  name = genericMessage
  constructor(message: string | number = genericMessage) {
    super(
      typeof message === 'number'
        ? `${genericMessage}: ${message} (see https://github.com/apollographql/invariant-packages)`
        : message,
    )
    setPrototypeOf(this, InvariantError.prototype)
  }
}

export function invariant(condition: any, message?: string | number) {
  if (!condition) {
    throw new InvariantError(message)
  }
}

export default invariant
