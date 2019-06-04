/* @flow */

import { Animated } from 'react-native'

/**
 * REACT NATIVE ANIMATION TYPES
 */

// From react-native/Libraries/Animated/src/nodes/AnimatedInterpolation
type ExtrapolateType = 'extend' | 'identity' | 'clamp'
type InterpolationConfigType = {
  inputRange: Array<number>,
  outputRange: Array<number> | Array<string>,
  easing?: (input: number) => number,
  extrapolate?: ExtrapolateType,
  extrapolateLeft?: ExtrapolateType,
  extrapolateRight?: ExtrapolateType,
}
type AnimatedInterpolation = {
  interpolate: (config: InterpolationConfigType) => AnimatedInterpolation,
}

// From react-native/Libraries/Animated/src/animations/Animation.js
type EndResult = { finished: boolean }
type EndCallback = (result: EndResult) => void
type Animation = {
  start: (
    fromValue: number,
    onUpdate: (value: number) => void,
    onEnd: ?EndCallback,
    previousAnimation: ?Animation,
    animatedValue: AnimatedValue
  ) => void,
  stop: () => void,
}

// From react-native/Libraries/Animated/src/nodes/AnimatedTracking.js
type AnimatedTracking = {
  constructor: (
    value: AnimatedValue,
    parent: any,
    animationClass: any,
    animationConfig: Object,
    callback?: ?EndCallback
  ) => void,
  update: () => void,
}

// From react-native/Libraries/Animated/src/nodes/AnimatedValue.js
type ValueListenerCallback = (state: { value: number }) => void
type AnimatedValue = {
  constructor: (value: number) => void,
  setValue: (value: number) => void,
  setOffset: (offset: number) => void,
  flattenOffset: () => void,
  extractOffset: () => void,
  addListener: (callback: ValueListenerCallback) => string,
  removeListener: (id: string) => void,
  removeAllListeners: () => void,
  stopAnimation: (callback?: ?(value: number) => void) => void,
  resetAnimation: (callback?: ?(value: number) => void) => void,
  interpolate: (config: InterpolationConfigType) => AnimatedInterpolation,
  animate: (animation: Animation, callback: ?EndCallback) => void,
  stopTracking: () => void,
  track: (tracking: AnimatedTracking) => void,
}

// From react-native/Libraries/Animated/src/animations/Animation.js
type AnimationConfig = {
  isInteraction?: boolean,
  useNativeDriver?: boolean,
  onComplete?: ?EndCallback,
  iterations?: number,
}

// From react-native/Libraries/Animated/src/animations/TimingAnimation.js
type TimingAnimationConfig = AnimationConfig & {
  toValue: number | AnimatedValue | { x: number, y: number },
  easing?: (value: number) => number,
  duration?: number,
  delay?: number,
}

/**
 * REACT NATIVE MODALFY TYPES
 */

export type ModalName = string

export type TransitionOptions = AnimatedValue => {
  [key: string]:
    | AnimatedInterpolation
    | Array<{ [key: string]: AnimatedInterpolation }>,
}

export type Config = {
  [key: ModalName]: React$ComponentType<*>,
  animateInConfig?: TimingAnimationConfig,
  animateOutConfig?: TimingAnimationConfig,
  modal?: React$ComponentType<*>,
  position?: 'center' | 'top' | 'bottom',
  shouldAnimateOut?: boolean,
  transitionOptions?: TransitionOptions,
}

export type Options = {
  animateInConfig?: TimingAnimationConfig,
  animateOutConfig?: TimingAnimationConfig,
  backdropOpacity?: number,
  backButtonBehavior?: 'clear' | 'pop' | 'none',
  position?: 'center' | 'top' | 'bottom',
  shouldAnimateOut?: boolean,
  transitionOptions?: TransitionOptions,
}

type Params = { [key: ModalName]: Object }

export type StackItem = {
  name: ModalName,
  component: React$ComponentType<*>,
  hash: string,
  index: number,
  options?: Options,
  params?: any,
}

export type Stack = {
  names: Array<ModalName>,
  content: Array<StackItem>,
  defaultOptions: Options,
  openedItems: Array<?StackItem>,
  params?: Params,
  total: number,
}

type EventCallback = AnimatedValue => void

type ModalEventSubscription = {
  remove: () => void,
}

export type Modal = {
  addListener: (
    eventName: string,
    callback: EventCallback
  ) => ModalEventSubscription,
  currentModal: ?ModalName,
  openModal: (modalName: ModalName, params?: Object) => void,
  closeModal: (modal?: ModalName) => void,
  getParams: (modalName: ModalName, fallback?: any) => any,
  params?: any,
}
