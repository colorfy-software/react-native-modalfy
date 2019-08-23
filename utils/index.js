/* @flow */

import { Dimensions, Easing } from 'react-native'

import type { Options } from '../types'

export const vw = (percentage: number): number =>
  (Dimensions.get('window').width * percentage) / 100

export const vh = (percentage: number): number =>
  (Dimensions.get('window').height * percentage) / 100

export const defaultOptions: Options = {
  animateInConfig: {
    duration: 450,
    easing: Easing.inOut(Easing.exp),
  },
  animateOutConfig: {
    duration: 450,
    easing: Easing.inOut(Easing.exp),
  },
  backdropOpacity: 0.6,
  position: 'center',
  backButtonBehavior: 'pop',
  shouldAnimateOut: true,
}

export { default as getStackItemData } from './getStackItemData'
export { default as getStackItemOptions } from './getStackItemOptions'
export { default as invariant } from './invariant'
export { default as validateDefaultOptions } from './validateDefaultOptions'
export { default as validateListener } from './validateListener'
