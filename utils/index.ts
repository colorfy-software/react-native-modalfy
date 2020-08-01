import { Dimensions, Easing } from 'react-native'

import { ModalOptions } from '../types'

export const vw = (percentage: number) =>
  (Dimensions.get('window').width * percentage) / 100

export const vh = (percentage: number) =>
  (Dimensions.get('window').height * percentage) / 100

export const defaultOptions: ModalOptions = {
  animateInConfig: {
    duration: 450,
    easing: Easing.inOut(Easing.exp),
  },
  animateOutConfig: {
    duration: 450,
    easing: Easing.inOut(Easing.exp),
  },
  disableFlingGesture: false,
  shouldAnimateOut: true,
  backdropOpacity: 0.6,
  backBehavior: 'pop',
  containerStyle: {},
  position: 'center',
}

export { default as validateDefaultOptions } from './validateDefaultOptions'
export { default as getStackItemOptions } from './getStackItemOptions'
export { default as getStackItemData } from './getStackItemData'
export { default as validateListener } from './validateListener'
export { default as invariant } from './invariant'
