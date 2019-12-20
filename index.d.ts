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
type EndCallback = (result: EndResult) => void
interface Animation {
  start: (
    fromValue: number,
    onUpdate: (value: number) => void,
    onEnd: EndCallback?,
    previousAnimation: Animation?,
    animatedValue: AnimatedValue,
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
    callback?: EndCallback?,
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
  animate: (animation: Animation, callback: EndCallback?) => void
  stopTracking: () => void
  track: (tracking: AnimatedTracking) => void
}

// From react-native/Libraries/Animated/src/animations/Animation.js
interface AnimationConfig {
  isInteraction?: boolean
  useNativeDriver?: boolean
  onComplete?: ?EndCallback
  iterations?: number
}

// From react-native/Libraries/Animated/src/animations/TimingAnimation.js
type TimingAnimationConfig = AnimationConfig & {
  toValue?: number & AnimatedValue & { x: number, y: number }
  easing?: (value: number) => number
  duration?: number
  delay?: number
}

/********
 * TYPES
 *******/

export type ModalName = string

export type TransitionOptions = (animatedValue: AnimatedValue) => {
  [key: string]:
    | AnimatedInterpolation
    | Array<{ [key: string]: AnimatedInterpolation }>
}

export interface Config {
  [key: ModalName]: React.ComponentType<any>
  animateInConfig?: TimingAnimationConfig
  animateOutConfig?: TimingAnimationConfig
  containerStyle?: ViewStyle
  modal?: React.ComponentType<any>
  position?: 'center' | 'top' | 'bottom'
  shouldAnimateOut?: boolean
  transitionOptions?: TransitionOptions
}

export interface Options {
  animateInConfig?: TimingAnimationConfig
  animateOutConfig?: TimingAnimationConfig
  backdropOpacity?: number
  backButtonBehavior?: 'clear' | 'pop' | 'none'
  containerStyle?: ViewStyle
  position?: 'center' | 'top' | 'bottom'
  shouldAnimateOut?: boolean
  transitionOptions?: TransitionOptions
}

export interface StackItem {
  name: ModalName
  component: React.Component & { modalOptions?: Options }
  hash: string
  index: number
  options?: Options
  params?: any
}

export interface Stack<T> {
  names: Array<ModalName>
  content: Array<StackItem>
  defaultOptions: Options
  openedItems: T
  total: number
}

export type EventName = 'onAnimate'
export type EventNames = Array<EventName>

export type EventCallback = (animatedValue?: AnimatedValue) => void

interface EventSubscription {
  remove: () => boolean
}

export type ModalListener = (
  eventName: EventName,
  callback: EventCallback,
) => EventSubscription

export interface EventListeners {
  event: string,
  handler: EventCallback
}

export type ModalEventListeners = Set<EventListeners>

export interface Modal {
  addListener: ModalListener
  currentModal: ?ModalName
  openModal: (modalName: ModalName, params?: Object) => void
  closeAllModals: () => void
  closeModal: (modalName?: ModalName) => void
  closeModals: (modalName: ModalName) => void
  getParams: (modalName: ModalName, fallback?: any) => any
  removeAllListeners: () => void
  params?: any
}

export interface WithModal {
  currentModal: ?ModalName
  openModal: (modalName: ModalName, params?: Object) => void
  closeAllModals: () => void
  closeModal: (modalName?: ModalName) => void
  closeModals: (modalName: ModalName) => void
}

export interface SharedProps {
  clearListeners: (hash: string) => void
  closeAllModals: () => void
  closeModal: (stackItem: StackItem) => void
  closeModals: (modalName: ModalName) => void
  currentModal: ?ModalName
  eventListeners: ModalEventListeners
  getParams: (hash: ?string, fallback: any) => any
  openModal: (modalName: ModalName) => void
  registerListener: (
    hash: string,
    eventName: EventName,
    handler: () => void,
  ) => EventSubscription
  stack: Stack<Set<StackItem>>
}


/**********
 * METHODS
 *********/

export function createModalStack(
  config: Config,
  customDefaultOptions: Options
): Stack<Set<StackItem>>

export function withModal<P extends object>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, keyof WithModal>>

export function useModal(): WithModal

export type ModalProvider = React.ComponentType<{ stack: Stack }>
