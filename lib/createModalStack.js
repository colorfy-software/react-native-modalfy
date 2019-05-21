/* @flow */

import type { Config, Options, Stack } from './types'
import {
  invariant,
  getStackItemData,
  defaultOptions,
  validateDefaultOptions,
} from '../utils'

export default function(config: Config, customDefaultOptions: Options): Stack {
  invariant(config, 'You need to provide a config to createModalStack()')
  validateDefaultOptions(customDefaultOptions)

  let stack: Stack = {
    names: [],
    content: [],
    defaultOptions: {
      ...defaultOptions,
      ...customDefaultOptions,
    },
    openedItems: [],
    total: 0,
  }

  Object.entries(config).map((entry, index) => {
    const { name, component, options } = getStackItemData(entry[0], entry[1])
    stack = {
      ...stack,
      names: [...stack.names, name],
      content: [
        ...stack.content,
        { index, name, component, ...(options && { options }) },
      ],
      total: stack.total + 1,
    }
  })

  return stack
}
