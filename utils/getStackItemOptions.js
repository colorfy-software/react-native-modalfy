/* @flow */

import type { Stack, StackItem } from '../types'

export default function(stackItem: StackItem, stack: Stack) {
  return {
    animateInConfig:
      stackItem?.component.modalOptions?.animateInConfig ||
      stackItem?.options?.animateInConfig ||
      stack.defaultOptions.animateInConfig,
    animateOutConfig:
      stackItem?.component.modalOptions?.animateOutConfig ||
      stackItem?.options?.animateOutConfig ||
      stack.defaultOptions.animateOutConfig,
    position:
      stackItem?.component.modalOptions?.position ||
      stackItem.options?.position ||
      stack.defaultOptions.position,
    shouldAnimateOut:
      stackItem?.component.modalOptions?.shouldAnimateOut ??
      stackItem?.options?.shouldAnimateOut ??
      stack.defaultOptions.shouldAnimateOut,
    transitionOptions:
      stackItem?.component.modalOptions?.transitionOptions ||
      stackItem?.options?.transitionOptions ||
      stack.defaultOptions.transitionOptions,
  }
}
