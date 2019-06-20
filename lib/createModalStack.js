/* @flow */

import type { Config, Options, Stack, StackItem } from '../types'
import {
  invariant,
  getStackItemData,
  defaultOptions,
  validateDefaultOptions,
} from '../utils'

export default function(
  config: Config,
  customDefaultOptions: Options
): Stack<Set<StackItem>> {
  invariant(config, 'You need to provide a config to createModalStack()')
  validateDefaultOptions(customDefaultOptions)

  const initialStack: Stack<Set<StackItem>> = {
    names: [],
    content: [],
    defaultOptions: {
      ...defaultOptions,
      ...customDefaultOptions,
    },
    openedItems: new Set(),
    total: 0,
  }

  return Object.entries(config).reduce((output, entry, index) => {
    const { name, component, options } = getStackItemData(entry[0], entry[1])
    return {
      ...output,
      names: [...output.names, name],
      content: [
        ...output.content,
        { index, name, component, hash: '', ...(options && { options }) },
      ],
      total: output.total + 1,
    }
  }, initialStack)
}
