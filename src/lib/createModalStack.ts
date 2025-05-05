import type { ModalStack, ModalStackConfig, ModalOptions, ModalfyParams } from '../types'

import { invariant, defaultOptions, getStackItemData, validateDefaultOptions } from '../utils'

/**
 * `createModalStack()` is the function that's going to turn your configuration into a usable modal stack.
 *
 * @argument { ModalStackConfig } config - Modal stack configuration.
 * @argument { ModalOptions } [customDefaultOptions] - Configuration options to apply to all modals by default (optional).
 *
 * @returns { ModalStack } Modal stack configuration object to provide to `<ModalProvider>`'s `stack` prop.
 *
 * @see https://colorfy-software.gitbook.io/react-native-modalfy/guides/stack
 */
export default function <P extends ModalfyParams>(
  config: ModalStackConfig,
  customDefaultOptions?: ModalOptions,
): ModalStack<P> {
  invariant(config, 'You need to provide a config to createModalStack()')

  validateDefaultOptions(customDefaultOptions)

  const initialStack: ModalStack<P> = {
    names: [],
    content: [],
    defaultOptions: {
      ...defaultOptions,
      ...customDefaultOptions,
    },
    openedItems: new Set(),
    pendingClosingActions: new Set(),
  }

  return Object.entries(config).reduce<ModalStack<P>>((output, entry, index): ModalStack<P> => {
    const { name, component, options } = getStackItemData(entry[0], entry[1])
    return {
      ...output,
      names: [...output.names, name] as ModalStack<P>['names'],
      content: [
        ...output.content,
        { index, name, component, hash: '', ...(options && { options }) },
      ] as ModalStack<P>['content'],
    }
  }, initialStack)
}
