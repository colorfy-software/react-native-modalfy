/* @flow */

import type { Config, Options, Stack } from './types'
import {
  invariant,
  getStackItemData,
  defaultOptions,
  validateDefaultOptions,
} from './utils'

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

  return Object.entries(config).reduce((accum, entry, index) => {
    const { name, component, options } = getStackItemData(entry[0], entry[1])
    return {
      ...accum,
      names: [...accum.names, name],
      content: [
        ...accum.content,
        { index, name, component, ...(options && { options }) },
      ],
      total: accum.total + 1,
    }
  }, initialStack)
}
