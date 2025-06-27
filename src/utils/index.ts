import { Dimensions, Easing } from 'react-native'

import type { ModalOptions, ModalStackItemOptions, ModalStackOptions } from '../types'

export const vw = (percentage: number) => (Dimensions.get('window').width * percentage) / 100

export const vh = (percentage: number) => (Dimensions.get('window').height * percentage) / 100

export const sh = (percentage: number) => (Dimensions.get('screen').height * percentage) / 100

export const defaultOptions: ModalOptions = {
  animateInConfig: {
    duration: 450,
    easing: Easing.inOut(Easing.exp),
  },
  animateOutConfig: {
    duration: 450,
    easing: Easing.inOut(Easing.exp),
  },
  containerStyle: {},
  position: 'center',
  backBehavior: 'pop',
  backdropOpacity: 0.6,
  backdropPosition: 'root',
  disableFlingGesture: false,
  pointerEventsBehavior: 'auto',
  backdropAnimationDuration: 300,
}

export const queueMacroTask = (fn: (() => void) | undefined, delay = 0) => {
  if (typeof fn === 'function') {
    const timeout = setTimeout(() => {
      clearTimeout(timeout)
      fn?.()
    }, delay)
  }
}

export function computeUpdatedModalOptions(
  type: 'modalStack',
  newOptions: ModalOptions,
  oldOptions: ModalStackOptions,
): ModalStackOptions

export function computeUpdatedModalOptions(
  type: 'stackItem',
  newOptions: ModalOptions,
  oldOptions: ModalStackItemOptions,
): ModalStackItemOptions

export function computeUpdatedModalOptions(
  type: 'modalStack' | 'stackItem',
  newOptions: ModalOptions,
  oldOptions: ModalStackOptions | ModalStackItemOptions,
): ModalStackOptions | ModalStackItemOptions {
  if (type === 'stackItem') {
    const prevOptions = oldOptions as ModalStackItemOptions
    return {
      position: newOptions.position ?? prevOptions?.position,
      animationIn: newOptions.animationIn ?? prevOptions?.animationIn,
      animationOut: newOptions.animationOut ?? prevOptions?.animationOut,
      backBehavior: newOptions.backBehavior ?? prevOptions?.backBehavior,
      containerStyle: newOptions.containerStyle ?? prevOptions?.containerStyle,
      animateInConfig: newOptions.animateInConfig ?? prevOptions?.animateInConfig,
      animateOutConfig: newOptions.animateOutConfig ?? prevOptions?.animateOutConfig,
      transitionOptions: newOptions.transitionOptions ?? prevOptions?.transitionOptions,
      disableFlingGesture: newOptions.disableFlingGesture ?? prevOptions?.disableFlingGesture,
      pointerEventsBehavior: newOptions.pointerEventsBehavior ?? prevOptions?.pointerEventsBehavior,
    }
  }

  const prevOptions = oldOptions as ModalStackOptions

  return {
    backBehavior: newOptions.backBehavior ?? prevOptions?.backBehavior,
    backdropColor: newOptions.backdropColor ?? prevOptions?.backdropColor,
    backdropOpacity: newOptions.backdropOpacity ?? prevOptions?.backdropOpacity,
    backdropPosition: newOptions.backdropPosition ?? prevOptions?.backdropPosition,
    stackContainerStyle: newOptions.stackContainerStyle ?? prevOptions?.stackContainerStyle,
    backdropAnimationDuration: newOptions.backdropAnimationDuration ?? prevOptions?.backdropAnimationDuration,
  }
}

export { default as invariant } from './invariant'
export { default as getStackItemData } from './getStackItemData'
export { default as validateListener } from './validateListener'
export { default as getStackItemOptions } from './getStackItemOptions'
export { default as validateDefaultOptions, validateStackItemOptions } from './validateOptions'
