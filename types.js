/* @flow */

import { Animated } from 'react-native'

export type ModalName = string

export type TransitionOptions = Animated.AnimatedValue => {
  [key: string]:
    | Animated.AnimatedInterpolation
    | Array<{ [key: string]: Animated.AnimatedInterpolation }>,
}

export type Config = {
  [key: ModalName]: React$Element<*>,
  animateInConfig?: Animated.TimingAnimationConfig,
  animateOutConfig?: Animated.TimingAnimationConfig,
  modal?: React$Element<*>,
  position?: 'center' | 'top' | 'bottom',
  shouldAnimateOut?: boolean,
  transitionOptions?: TransitionOptions,
}

export type Options = {
  animateInConfig?: Animated.TimingAnimationConfig,
  animateOutConfig?: Animated.TimingAnimationConfig,
  backdropOpacity?: number,
  backButtonBehavior?: 'clear' | 'pop' | 'none',
  position?: 'center' | 'top' | 'bottom',
  shouldAnimateOut?: boolean,
  transitionOptions?: TransitionOptions,
}

type Params = { [key: ModalName]: Object }

export type StackItem = {
  name: ModalName,
  component: React$Element<*> & { modalOptions?: Options },
  options?: Options,
}

export type Stack = {
  names: Array<ModalName>,
  content: Array<StackItem>,
  defaultOptions: Options,
  openedItems: Array<?StackItem>,
  params?: Params,
  total: number,
}

export type Modal = {
  currentModal: ?ModalName,
  openModal: (modalName: ModalName, params?: Object) => void,
  closeModal: (modal?: ModalName) => void,
  getParams: (modalName: ModalName, fallback?: any) => any,
  params?: any,
}
