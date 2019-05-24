/* @flow */

import type { Config, Options, Stack } from '../types'
import {
  invariant,
  getStackItemData,
  defaultOptions,
  validateDefaultOptions,
} from '../utils'

export default function(config: Config, customDefaultOptions: Options): Stack {
  invariant(config, 'You need to provide a config to createModalStack()')
  validateDefaultOptions(customDefaultOptions)

  const initialStack: Stack = {
    names: [],
    content: [],
    defaultOptions: {
      ...defaultOptions,
      ...customDefaultOptions,
    },
    openedItems: [],
    total: 0,
  }

  return Object.entries(config).reduce((output, entry, index) => {
    const { name, component, options } = getStackItemData(entry[0], entry[1])
    return {
      ...output,
      names: [...output.names, name],
      content: [
        ...output.content,
        { index, name, component, ...(options && { options }) },
      ],
      total: output.total + 1,
    }
  }, initialStack)
}
