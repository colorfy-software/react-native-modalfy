import type { ComponentType } from 'react'
import type { Animated, ViewStyle } from 'react-native'

/*  ========================                 ========================
 *
 *   ======================== INTERNAL TYPES ========================
 *
 *   ========================                ========================
 */

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ModalfyCustomParams {}

type ModalfyExtendedParams = ModalfyCustomParams[keyof ModalfyCustomParams] extends never
  ? { [key: string]: any }
  : ModalfyCustomParams

// It should be declared as interface to prevent typescript type replacement
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ModalfyParams extends ModalfyExtendedParams {}

export type ModalTransitionValue = Animated.AnimatedInterpolation | string | number | undefined | null

export type ModalTransitionOptions = (animatedValue: Animated.Value) => {
  [key: string]:
    | {
        [key: string]: ModalTransitionValue
      }[]
    | ModalTransitionValue
}

export type ModalListener = (eventName: ModalEventName, callback: ModalEventCallback) => ModalEventListener
export type ModalEventListeners = Set<{
  event: string
  handler: ModalEventCallback
}>

export type ModalEventName = 'onAnimate' | 'onClose'

export type ModalOnAnimateEventCallback = (value?: number) => void
export type ModalOnCloseEventCallback = (closingAction: {
  type: ModalClosingActionName
  origin: ModalClosingActionOrigin
}) => void
export type ModalClosingActionName = 'closeModal' | 'closeModals' | 'closeAllModals'
export type ModalClosingActionOrigin = 'default' | 'fling' | 'backdrop'
export type ModalEventCallback = ModalOnAnimateEventCallback | ModalOnCloseEventCallback

export type ModalEventListener = { remove: () => boolean }

export type ModalEventAction = 'add'

export type ModalEventPayload = {
  eventName: ModalEventName
  handler: ModalEventCallback
}

export type ModalStatePendingClosingAction =
  | {
      modalName?: string
      action: 'closeModal'
      callback?: () => void
    }
  | {
      modalName: string
      action: 'closeModals'
      callback?: () => void
    }
  | {
      modalName?: never
      action: 'closeAllModals'
      callback?: () => void
    }

export type ModalPendingClosingAction =
  | {
      hash: string
      currentModalHash?: string
      modalName?: string
      action: 'closeModal'
      callback?: () => void
    }
  | {
      hash: string
      currentModalHash?: string
      modalName: string
      action: 'closeModals'
      callback?: () => void
    }
  | {
      hash: string
      modalName?: never
      currentModalHash?: string
      action: 'closeAllModals'
      callback?: () => void
    }

export interface ModalStackItem<P extends ModalfyParams> {
  name: Exclude<keyof P, symbol | number>
  component: ComponentType<any> & { modalOptions?: ModalOptions }
  hash: string
  index: number
  options?: ModalOptions
  params?: any
  callback?: () => void
}

export interface ModalStack<P extends ModalfyParams> {
  names: Array<Exclude<keyof P, symbol | number>>
  content: ModalStackItem<P>[]
  defaultOptions: ModalOptions
  openedItems: Set<ModalStackItem<P>>
  openedItemsSize: number
  pendingClosingActions: Set<ModalPendingClosingAction>
  pendingClosingActionsSize: number
}

export interface ModalContextProvider<
  P extends ModalfyParams,
  M extends Exclude<keyof P, symbol | number> = Exclude<keyof P, symbol | number>,
> {
  currentModal: M | null
  closeAllModals: (callback?: () => void) => void
  closeModal: (stackItem?: M | ModalStackItem<P>, callback?: () => void) => void
  closeModals: (modalName: M, callback?: () => void) => boolean
  getParam: <N extends keyof P[M], D extends P[M][N]>(
    hash: ModalStackItem<P>['hash'],
    paramName: N,
    defaultValue?: D,
  ) => D extends P[M][N] ? P[M][N] : undefined
  openModal: <N extends M>(modalName: N, params?: P[N], callback?: () => void) => void
  stack: ModalStack<P>
}

export type ModalInternalState<P extends ModalfyParams> = {
  currentModal: ModalContextProvider<P>['currentModal'] | string | null
  stack: ModalContextProvider<P>['stack']
}

export interface ModalStateSubscriber<P extends ModalfyParams> {
  state: ModalInternalState<P>
  equalityFn: ModalStateEqualityChecker<P>
  error: boolean
  stateListener: ModalStateListener<P>
  unsubscribe: () => boolean
}

export interface ModalStateSubscription<P extends ModalfyParams> {
  unsubscribe: ModalStateSubscriber<P>['unsubscribe']
}

export type ModalStateListener<P extends ModalfyParams> = (state: ModalInternalState<P> | null, error?: Error) => void

export type ModalStateEqualityChecker<P extends ModalfyParams> = (
  currentState: ModalInternalState<P>,
  newState: ModalInternalState<P>,
) => boolean

export type ModalState<P extends ModalfyParams> = Omit<
  ModalContextProvider<P>,
  'currentModal' | 'stack' | 'openModal'
> & {
  openModal: <M extends Exclude<keyof P, symbol | number>, N extends M>(args: {
    modalName: N
    params?: P[N]
    isCalledOutsideOfContext?: boolean
    callback?: () => void
  }) => void
  handleBackPress: () => boolean
  init: <T extends ModalfyParams>(
    updater: (currentState: ModalInternalState<T>) => ModalInternalState<T>,
  ) => ModalInternalState<T>
  getState: <T extends ModalfyParams>() => ModalInternalState<T>
  setState: <T extends ModalfyParams>(
    updater: (currentState: ModalInternalState<T>) => ModalInternalState<T>,
  ) => ModalInternalState<T>
  subscribe: <T extends ModalfyParams>(
    listener: ModalStateListener<T>,
    equalityFn?: ModalStateEqualityChecker<T>,
  ) => ModalStateSubscription<T>
  queueClosingAction: (action: ModalStatePendingClosingAction) => ModalPendingClosingAction | null
  removeClosingAction: (action: ModalPendingClosingAction) => boolean
}

export interface SharedProps<P extends ModalfyParams> extends ModalContextProvider<P> {
  clearListeners: (hash: string) => void
  eventListeners: ModalEventListeners
  registerListener: (
    hash: ModalStackItem<P>['hash'],
    eventName: ModalEventName,
    handler: ModalEventCallback,
  ) => ModalEventListener
  removeClosingAction: ModalState<P>['removeClosingAction']
}

export type UsableModalProp<P extends ModalfyParams> = Pick<
  ModalContextProvider<P>,
  'closeAllModals' | 'closeModals' | 'currentModal' | 'openModal'
> & {
  closeModal: (modalName?: Exclude<keyof P, symbol | number>, callback?: () => void) => void
}

export interface UsableModalComponentProp<P extends ModalfyParams, M extends keyof P>
  extends Omit<ModalContextProvider<P>, 'closeModal' | 'stack' | 'getParam'> {
  addListener: ModalListener
  closeModal: (modalName?: M, callback?: () => void) => void
  getParam: <N extends keyof P[M], D extends P[M][N]>(
    paramName: N,
    defaultValue?: D,
  ) => D extends P[M][N] ? P[M][N] : undefined
  removeAllListeners: () => void
  params?: P[M]
}

/*  ========================                 ========================
 *
 *   ======================== CONSUMER TYPES ========================
 *
 *   ========================                ========================
 */

/**
 * Interface of the modal stack configuration.
 * These settings will let Modalfy know what modals you will be rendering and how.
 *
 * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#config-and-options).
 */
export interface ModalStackConfig {
  [key: string]: ComponentType<any> | ModalOptions
}

/**
 * Interface of the modal configuration options.
 * These settings will let Modalfy how to render and animate a modal.
 *
 * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#config-and-options).
 */
export interface ModalOptions {
  /**
   * Animation configuration used to animate a modal in, at the top of the stack.
   * It uses Animated.timing() by default, if you want to use another animation type, see `animationIn`.
   *
   * Note: only `easing` and `duration` are needed.
   *
   * @default { easing: Easing.inOut(Easing.exp), duration: 450 }
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#animateinconfig).
   */
  animateInConfig?: Pick<Animated.TimingAnimationConfig, 'duration' | 'easing'>
  /**
   * Animation function that receives the `animatedValue` used by the library to animate the modal opening,
   * and a `toValue` argument representing the modal position in the stack.
   *
   * Since Modalfy v3, the function receives a `callback` argument, which _can_ be called when the animation is finished,
   * depending on whether or not you'll have a callback in a `openModal()`.
   *
   * Note: If you just want to use Animated.timing(), check `animateInConfig`.
   *
   * @default -
   * @example
   * animationIn: (modalAnimatedValue, modalToValue, callback) => {
   *   Animated.parallel([
   *     Animated.timing(modalAnimatedValue, {
   *       toValue: modalToValue,
   *       duration: 300,
   *       easing: Easing.inOut(Easing.exp),
   *       useNativeDriver: true,
   *     }),
   *     Animated.timing(myOtherAnimatedValue, {
   *       toValue: 1,
   *       duration: 300,
   *       easing: Easing.inOut(Easing.exp),
   *       useNativeDriver: true,
   *     }),
   *   ]).start(({ finished }) => {
   *     if (finished) callback?.()
   *   })
   * }
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#animationin).
   */
  animationIn?: (
    animatedValue: Animated.Value,
    toValue: number,
    callback?: () => void,
  ) => Animated.CompositeAnimation | void
  /**
   * Animation configuration used to animate a modal out (underneath other modals or when closing the last one).
   * Uses Animated.timing(), if you want to use another animation type, use `animationOut`.
   *
   * Note: only `easing` and `duration` are needed.
   *
   * @default { easing: Easing.inOut(Easing.exp), duration: 450 }
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#animationout).
   */
  animateOutConfig?: Pick<Animated.TimingAnimationConfig, 'duration' | 'easing'>
  /**
   * Animation function that receives the `animatedValue` used by the library to animate the modal closing,
   * and a `toValue` argument representing the modal position in the stack.
   *
   * Since Modalfy v3, the function receives a `callback` argument, which **_must_** be called when the animation is finished.
   *
   * Note: If you just want to use Animated.timing(), check `animateOutConfig`.
   *
   * @default -
   * @example
   * animationOut: (modalAnimatedValue, modalToValue, callback) => {
   *   Animated.parallel([
   *     Animated.timing(modalAnimatedValue, {
   *       toValue: modalToValue,
   *       duration: 300,
   *       easing: Easing.inOut(Easing.exp),
   *       useNativeDriver: true,
   *     }),
   *     Animated.timing(myOtherAnimatedValue, {
   *       toValue: 1,
   *       duration: 300,
   *       easing: Easing.inOut(Easing.exp),
   *       useNativeDriver: true,
   *     }),
   *   ]).start(({ finished }) => {
   *     if (finished) callback()
   *   })
   * }
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#animationout).
   */
  animationOut?: (
    animatedValue: Animated.Value,
    toValue: number,
    callback?: () => void,
  ) => Animated.CompositeAnimation | void
  /**
   * How you want the modal stack to behave when users press the backdrop, but also when the physical back button is pressed on Android.
   *
   * @default 'pop'
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#backbehavior).
   */
  backBehavior?: 'clear' | 'pop' | 'none'
  /**
   * Color of the modal stack backdrop.
   *
   * @default 'black'
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#backdropcolor).
   */
  backdropColor?: ViewStyle['backgroundColor']
  /**
   * Number between `0` and `1` that defines the backdrop opacity.
   *
   * @default 0.6
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#backdropopacity).
   */
  backdropOpacity?: number
  /**
   * Number that defines how long the backdrop should take to animate in and out.
   *
   * @default 300
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#backdropanimationduration).
   */
  backdropAnimationDuration?: number
  /**
   * Styles applied to the `<View>` directly wrapping your modal component.
   *
   * @default '{}'
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#containerstyle).
   */
  containerStyle?: ViewStyle
  /**
   * Disable fling gesture detection to close the modal.
   *
   * Note: the fling gesture handler is not enabled when `position` is `center`.
   *
   * @default false
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#disableflinggesture).
   */
  disableFlingGesture?: boolean
  /**
   * React component that will be rendered when you'll open the modal.
   *
   * Note: only needed when you're using this inside createModalStack() 1st argument.
   *
   * @default -
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#modal).
   */
  modal?: ComponentType<any>
  /**
   * Vertical positioning of the modal.
   *
   * @default 'center'
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#position).
   */
  position?: 'center' | 'top' | 'bottom'
  /**
   * `transitionOptions(animatedValue)` returns a React Native style object containing values that can use the provided `animatedValue` to run animation interpolations on a modal.
   *
   * Note: the object returned by `transitionOptions()` must contain keys that work with `useNativeDriver: true`.
   *
   * @default -
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#transitionoptions).
   */
  transitionOptions?: ModalTransitionOptions
  /**
   * How you want any modal to respond to a touch/click.
   *
   * @default 'auto'
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modaloptions#pointereventsbehavior).
   */
  pointerEventsBehavior?: 'auto' | 'none' | 'current-modal-only' | 'current-modal-none'
}

/**
 * Interface of the `modal` prop exposed by the library to regular components.
 *
 * @argument { unknown } ModalStackParamsList? - Interface of the whole modal stack params.
 * @argument { unknown } Props? - Component's props interface.
 *
 * Note: Modal components used in `createModalStack()`'s config should employ `ModalComponentProp` instead.
 *
 * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#modalprop).
 */
export type ModalProp<P extends ModalfyParams, Props = unknown> = Props & {
  /**
   * Interface of the `modal` prop exposed by the library to regular components.
   *
   * Note: Modal components used in `createModalStack()`'s config should employ `ModalComponentProp` instead.
   *
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#modalprop).
   */
  modal: UsableModalProp<P>
}

/**
 * Interface of the `modal` prop exposed by the library specifically to modal components.
 *
 * @argument { unknown } ModalStackParamsList? - Interface of the whole modal stack params.
 * @argument { unknown } Props? - Component's props interface.
 * @argument { string } ModalName? - Name of the current modal
 *
 * Note: Components that are not used from `createModalStack()`'s config should employ `ModalProp` instead.
 *
 * @related [`ModalProps`](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#modalprops).
 * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#modalcomponentprop).
 */
export type ModalComponentProp<P extends ModalfyParams, Props = unknown, M extends keyof P = keyof P> = Props & {
  /**
   * Interface of the `modal` prop exposed by the library specifically to modal components.
   *
   * Note:
   * * A simplified version of this interface is ModalProps.
   * * Components that are not used from `createModalStack()`'s config should employ `ModalProp` instead.
   *
   * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#modalcomponentprop).
   */
  modal: UsableModalComponentProp<P, M>
}

/**
 * Interface of the `modal` prop exposed by the library specifically to modal components.
 *
 * @argument { string } ModalName? - Name of the current modal
 * @argument { unknown } Props? - Component's props interface.
 *
 * Note: Components that are not used from `createModalStack()`'s config should employ `ModalProp` instead.
 *
 * @related [`ModalComponentProp`](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#modalcomponentprop).
 * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#modalprops).
 */
export type ModalProps<N extends keyof ModalfyParams = keyof ModalfyParams, P = void> = ModalComponentProp<
  ModalfyParams,
  P,
  N
>

/**
 * Interface for a React component containing its props and the `modalOptions` static property.
 *
 * Note: Only use with Hooks modal components (those present in your `createModalStack()`'s config).
 * If you're working with a Class modal component, you can directly use `static modalOptions: ModalOptions`.
 *
 * @argument { unknown } Props? - Component's props interface.
 *
 * @see [API reference](https://colorfy-software.gitbook.io/react-native-modalfy/guides/typing#modalcomponentwithoptions).
 */
export type ModalComponentWithOptions<P = unknown> = ComponentType<P> & {
  modalOptions?: ModalOptions
}
