import React from 'react'
import { Animated, ViewStyle } from 'react-native'

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

/**
 * REACT NATIVE ANIMATION TYPES
 */

// From react-native/Libraries/Animated/src/nodes/AnimatedInterpolation
type ExtrapolateType = 'extend' | 'identity' | 'clamp'

interface InterpolationConfigType {
  inputRange: Array<number>
  outputRange: Array<number> | Array<string>
  easing?: (input: number) => number
  extrapolate?: ExtrapolateType
  extrapolateLeft?: ExtrapolateType
  extrapolateRight?: ExtrapolateType
}

interface AnimatedInterpolation {
  interpolate: (config: InterpolationConfigType) => AnimatedInterpolation
}

// From react-native/Libraries/Animated/src/animations/Animation.js
interface EndResult {
  finished: boolean
}

type EndCallback = (result: EndResult) => void | void

interface Animation {
  start: (
    fromValue: number,
    onUpdate: (value: number) => void,
    onEnd: EndCallback,
    previousAnimation: Animation | void,
    animatedValue: AnimatedValue
  ) => void
  stop: () => void
}

// From react-native/Libraries/Animated/src/nodes/AnimatedTracking.js
interface AnimatedTracking {
  constructor: (
    value: AnimatedValue,
    parent: any,
    animationClass: any,
    animationConfig: Object,
    callback?: EndCallback
  ) => void
  update: () => void
}

// From react-native/Libraries/Animated/src/nodes/AnimatedValue.js
type ValueListenerCallback = (state: { value: number }) => void
interface AnimatedValue {
  constructor: (value: number) => void
  setValue: (value: number) => void
  setOffset: (offset: number) => void
  flattenOffset: () => void
  extractOffset: () => void
  addListener: (callback: ValueListenerCallback) => string
  removeListener: (id: string) => void
  removeAllListeners: () => void
  stopAnimation: (callback?: (value: number) => void | undefined) => void
  resetAnimation: (callback?: (value: number) => void | undefined) => void
  interpolate: (config: InterpolationConfigType) => AnimatedInterpolation
  animate: (animation: Animation, callback: EndCallback) => void
  stopTracking: () => void
  track: (tracking: AnimatedTracking) => void
}

// From react-native/Libraries/Animated/src/animations/Animation.js
interface AnimationConfig {
  isInteraction?: boolean
  useNativeDriver?: boolean
  onComplete?: EndCallback
  iterations?: number
}

// From react-native/Libraries/Animated/src/animations/TimingAnimation.js
type TimingAnimationConfig = AnimationConfig & {
  toValue?: number & AnimatedValue & { x: number; y: number }
  easing?: (value: number) => number
  duration?: number
  delay?: number
}

/**
 * INTERNAL TYPES
 */

interface ModalStackItem {
  name: ModalName
  component: React.Component & { modalOptions?: ModalStackOptions }
  hash: string
  index: number
  options?: ModalStackOptions
  params?: any
}

interface ModalStack<T> {
  names: Array<ModalName>
  content: Array<ModalStackItem>
  defaultOptions: ModalStackOptions
  openedItems: T
  total: number
}

interface EventListeners {
  event: string
  handler: ModalEventCallback
}

type ModalEventListeners = Set<EventListeners>

interface SharedProps {
  clearListeners: (hash: string) => void
  closeAllModals: () => void
  closeModal: (stackItem: ModalStackItem) => void
  closeModals: (modalName: ModalName) => void
  currentModal: ModalName | null
  eventListeners: ModalEventListeners
  getParams: (hash: string | void, fallback: any) => any
  openModal: (modalName: ModalName) => void
  registerListener: (
    hash: string,
    eventName: ModalEventName,
    handler: () => void
  ) => ModalEventSubscription
  stack: ModalStack<Set<ModalStackItem>>
}

/********
 * TYPES
 *******/

/**
 * Interface to be used to type `createModalStack()`'s
 * 1st argument, library's default config.
 */
export interface ModalStackConfig {
  [key: string]: React.ComponentType<any>
  animateInConfig?: TimingAnimationConfig
  animateOutConfig?: TimingAnimationConfig
  containerStyle?: ViewStyle
  modal?: React.ComponentType<any>
  position?: 'center' | 'top' | 'bottom'
  shouldAnimateOut?: boolean
  transitionOptions?: ModalTransitionOptions
}

export type ModalName = string
export type ModalTransitionOptions = (
  animatedValue: AnimatedValue
) => {
  [key: string]:
    | AnimatedInterpolation
    | Array<{ [key: string]: AnimatedInterpolation }>
}

/**
 * Interface to be used to type `createModalStack()`'s
 * 2nd argument, library's default custom options.
 * Can also be used to type `static modalOptions: ModalStackOptions`
 * inside a modal component ().
 */
export interface ModalStackOptions {
  animateInConfig?: TimingAnimationConfig
  animateOutConfig?: TimingAnimationConfig
  backdropOpacity?: number
  backButtonBehavior?: 'clear' | 'pop' | 'none'
  containerStyle?: ViewStyle
  position?: 'center' | 'top' | 'bottom'
  shouldAnimateOut?: boolean
  transitionOptions?: ModalTransitionOptions
}

/**
 * Interface to be used inside a component to type the
 * `modal` prop provided by `withModal` / `useModal`.
 */
export interface ModalProp {
  currentModal: ModalName | null
  openModal: (modalName: ModalName, params?: Object) => void
  closeAllModals: () => void
  closeModal: (modalName?: ModalName) => void
  closeModals: (modalName: ModalName) => void
}

/**
 * Interface to be used inside a modal component to type
 * the `modal` prop provided automatically by the library.
 */
export interface ModalStackItemProp {
  addListener: ModalListener
  currentModal: ModalName | null
  openModal: (modalName: ModalName, params?: Object) => void
  closeAllModals: () => void
  closeModal: (modalName?: ModalName) => void
  closeModals: (modalName: ModalName) => void
  getParams: (modalName: ModalName, fallback?: any) => any
  removeAllListeners: () => void
  params?: any
}

export type ModalEventName = 'onAnimate'
export type ModalEventCallback = (animatedValue?: AnimatedValue) => void
export interface ModalEventSubscription {
  remove: () => boolean
}
export type ModalListener = (
  eventName: ModalEventName,
  callback: ModalEventCallback
) => ModalEventSubscription


/**********
 * METHODS
 *********/

export function createModalStack(
  config: ModalStackConfig,
  customDefaultOptions?: ModalStackOptions
): ModalStack<Set<ModalStackItem>>

export function withModal<P extends object>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, keyof ModalProp>>

export function useModal(): ModalProp

export class ModalProvider extends React.Component<{
  stack: ModalStack<Set<ModalStackItem>>
}> {}
