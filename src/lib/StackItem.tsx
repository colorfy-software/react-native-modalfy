import {
  Gesture,
  Directions,
  GestureDetector,
  GestureStateChangeEvent,
  FlingGestureHandlerEventPayload,
} from 'react-native-gesture-handler'
import { useMemo, useCallback } from 'use-memo-one'
import React, { ReactNode, useEffect, useRef, memo } from 'react'
import { Animated, StyleSheet, ViewProps, ViewStyle } from 'react-native'

import type {
  SharedProps,
  ModalfyParams,
  ModalStackItem,
  ModalEventName,
  ModalEventCallback,
  ModalPendingClosingAction,
  ModalOnCloseEventCallback,
  ModalOnAnimateEventCallback,
} from '../types'

import { getStackItemOptions, vh } from '../utils'

type Props<P extends ModalfyParams> = SharedProps<P> & {
  zIndex: number
  position: number
  hideBackdrop: () => void
  isLastOpenedModal: boolean
  isFirstVisibleModal: boolean
  stackItem: ModalStackItem<P>
  wasOpenCallbackCalled: boolean
  wasClosedByBackdropPress: boolean
  pendingClosingAction?: ModalPendingClosingAction
}

const addCallbackToMacroTaskQueue = (fn: (() => void) | undefined) => {
  if (typeof fn === 'function') {
    const timeout = setTimeout(() => {
      clearTimeout(timeout)
      fn?.()
    }, 0)
  }
}

const StackItem = <P extends ModalfyParams>({
  stack,
  zIndex,
  getParam,
  position,
  stackItem,
  openModal,
  closeModal,
  closeModals,
  currentModal,
  hideBackdrop,
  closeAllModals,
  eventListeners,
  clearListeners,
  registerListener,
  isLastOpenedModal,
  isFirstVisibleModal,
  removeClosingAction,
  pendingClosingAction,
  wasOpenCallbackCalled,
  wasClosedByBackdropPress,
}: Props<P>) => {
  const { animatedValue, translateY } = useMemo(
    () => ({
      translateY: new Animated.Value(0),
      animatedValue: new Animated.Value(-1),
    }),
    [],
  )

  const onCloseListener = useRef<ModalOnCloseEventCallback>(() => undefined)

  const {
    animationIn,
    animationOut,
    backBehavior,
    containerStyle,
    animateInConfig,
    animateOutConfig,
    transitionOptions,
    disableFlingGesture,
    pointerEventsBehavior,
    position: verticalPosition,
  } = useMemo(() => getStackItemOptions(stackItem, stack), [stack, stackItem])

  useEffect(() => {
    let onAnimateListener: ModalOnAnimateEventCallback | undefined = undefined

    if (transitionOptions && typeof transitionOptions !== 'function') {
      throw new Error(`'${stackItem.name}' transitionOptions should be a function. For instance:
      import ${stackItem.name} from './src/modals/${stackItem.name}';

      ...
      ${stackItem.name}: {
        modal: ${stackItem.name},
        transitionOptions: animatedValue => ({
          opacity: animatedValue.interpolate({
            inputRange: [0, 1, 2, 3],
            outputRange: [0, 1, 0.5, 0.25],
            extrapolate: 'clamp',
          }),
        }),
      },
      }`)
    }

    eventListeners.forEach(item => {
      if (item.event === `${stackItem.hash}_onAnimate`) {
        onAnimateListener = item.handler as ModalOnAnimateEventCallback
      } else if (item.event === `${stackItem.hash}_onClose`) {
        onCloseListener.current = item.handler as ModalOnCloseEventCallback
      }
    })

    if (typeof onAnimateListener === 'function') {
      animatedValue.addListener(({ value }) => onAnimateListener?.(value))
    }

    return () => {
      animatedValue.stopAnimation(() => animatedValue.removeAllListeners())
      clearListeners(stackItem.hash)
    }
  }, [])

  const updateAnimatedValue = useCallback(
    (
      toValue: number,
      internalClosingCallback?: (closingElement: ModalStackItem<P>) => void,
      stackItemCallback?: () => void,
    ) => {
      if (!internalClosingCallback && animationIn) {
        animationIn(animatedValue, toValue, stackItemCallback)
      } else if (internalClosingCallback && animationOut) {
        animationOut(animatedValue, toValue, () => {
          internalClosingCallback(stackItem)
          addCallbackToMacroTaskQueue(stackItemCallback)
        })
      } else {
        Animated.timing(animatedValue, {
          toValue,
          useNativeDriver: true,
          ...(internalClosingCallback ? animateOutConfig : animateInConfig),
        }).start(() => {
          internalClosingCallback?.(stackItem)
          addCallbackToMacroTaskQueue(stackItemCallback)
        })
      }
    },
    [stackItem, animationIn, animationOut, animatedValue, animateInConfig, animateOutConfig],
  )

  const closeStackItem = useCallback(
    (modalName, callback?: () => void) => {
      if (isLastOpenedModal) hideBackdrop()

      updateAnimatedValue(position - 1, () => {
        onCloseListener.current({ type: 'closeModal', origin: wasClosedByBackdropPress ? 'backdrop' : 'default' })
        closeModal(modalName)
        if (pendingClosingAction?.action === 'closeModal') removeClosingAction(pendingClosingAction)
        addCallbackToMacroTaskQueue(callback)
      })
    },
    [
      currentModal,
      closeModal,
      hideBackdrop,
      onCloseListener,
      position,
      pendingClosingAction,
      updateAnimatedValue,
      wasClosedByBackdropPress,
    ],
  )

  const closeStackItems = useCallback(
    (closingElement, callback?: () => void) => {
      if (isLastOpenedModal) hideBackdrop()

      return updateAnimatedValue(position - 1, () => {
        onCloseListener.current({ type: 'closeModals', origin: 'default' })
        let output = closeModals(closingElement)
        if (pendingClosingAction?.action === 'closeModals') removeClosingAction(pendingClosingAction)
        addCallbackToMacroTaskQueue(callback)
        return output
      })
    },
    [closeModals, currentModal, hideBackdrop, pendingClosingAction, position, updateAnimatedValue],
  )

  const closeAllStackItems = useCallback(
    (callback?: () => void) => {
      hideBackdrop()

      updateAnimatedValue(0, () => {
        onCloseListener.current({ type: 'closeAllModals', origin: wasClosedByBackdropPress ? 'backdrop' : 'default' })
        closeAllModals()
        if (pendingClosingAction?.action === 'closeAllModals') removeClosingAction(pendingClosingAction)
        addCallbackToMacroTaskQueue(callback)
      })
    },
    [closeAllModals, hideBackdrop, pendingClosingAction, position, updateAnimatedValue, wasClosedByBackdropPress],
  )

  const onFling = useCallback(
    (_: GestureStateChangeEvent<FlingGestureHandlerEventPayload>, success: boolean) => {
      if (success) {
        const toValue = verticalPosition === 'top' ? vh(-100) : vh(100)

        const onAnimationEnd = () => {
          animatedValue.setValue(position - 1)
          onCloseListener.current({ type: 'closeModal', origin: 'fling' })
          closeModal(stackItem)
        }

        if (animationOut) animationOut(translateY, toValue, onAnimationEnd)
        else {
          Animated.timing(translateY, {
            toValue,
            useNativeDriver: true,
            ...animateOutConfig,
          }).start(onAnimationEnd)
        }
      }
    },
    [animateOutConfig, closeModal, disableFlingGesture, hideBackdrop, stackItem, translateY, verticalPosition],
  )

  const pointerEvents = useMemo((): ViewProps['pointerEvents'] => {
    /**
     * NOTE: Using `box-only` instead of `none` here so that the modal would catch the event and not dispatch it to the backdrop.
     * If there's only 1 modal in the stack for instance, by using `none` and touching anywhere on the modal, the event
     * would be propagated to the backdrop which would close the modal, which is a pretty counterintuitive UX.
     */
    switch (pointerEventsBehavior) {
      case 'none':
        return 'box-only'
      case 'current-modal-none':
        return isFirstVisibleModal ? 'box-only' : 'box-none'
      case 'current-modal-only':
        return isFirstVisibleModal ? 'box-none' : 'box-only'
      case 'auto':
      default:
        return 'box-none'
    }
  }, [isFirstVisibleModal, pointerEventsBehavior])

  const Wrapper = disableFlingGesture ? Animated.View : GestureDetector

  const renderAnimatedComponent = (): ReactNode => {
    const Component = stackItem.component
    const addListener = (eventName: ModalEventName, handler: ModalEventCallback) =>
      registerListener(stackItem.hash, eventName, handler)
    const removeAllListeners = () => clearListeners(stackItem.hash)

    return (
      <Animated.View pointerEvents={pointerEvents} style={{ transform: [{ translateY }] }}>
        <Wrapper
          gesture={Gesture.Fling()
            .runOnJS(true)
            .direction(verticalPosition === 'top' ? Directions.UP : Directions.DOWN)
            .onEnd(onFling)}>
          <Animated.View style={{ ...(transitionOptions && transitionOptions(animatedValue)) }}>
            <Component
              modal={{
                openModal,
                addListener,
                currentModal,
                removeAllListeners,
                closeModal: closeStackItem,
                closeModals: closeStackItems,
                closeAllModals: closeAllStackItems,
                getParam: <N extends keyof P[NonNullable<typeof currentModal>]>(
                  paramName: N,
                  defaultValue?: P[NonNullable<typeof currentModal>][N],
                ): P[NonNullable<NonNullable<typeof currentModal>>][N] | undefined =>
                  getParam(stackItem.hash, paramName, defaultValue),
                ...(stackItem.params && { params: stackItem.params }),
              }}
            />
          </Animated.View>
        </Wrapper>
      </Animated.View>
    )
  }

  const justifyContent = useMemo((): ViewStyle['justifyContent'] => {
    switch (verticalPosition) {
      case 'top':
        return 'flex-start'
      case 'bottom':
        return 'flex-end'
      default:
        return 'center'
    }
  }, [verticalPosition])

  useEffect(() => {
    updateAnimatedValue(position, undefined, wasOpenCallbackCalled ? undefined : stackItem.callback)
  }, [position, stackItem.callback, updateAnimatedValue, wasClosedByBackdropPress])

  useEffect(() => {
    if (wasClosedByBackdropPress) {
      if (backBehavior === 'clear') closeAllStackItems()
      else closeStackItem(undefined)
    }
  }, [backBehavior, closeAllStackItems, closeStackItem, wasClosedByBackdropPress])

  useEffect(() => {
    if (pendingClosingAction) {
      if (pendingClosingAction.action === 'closeModal') {
        closeStackItem(pendingClosingAction.modalName, pendingClosingAction.callback)
      } else if (pendingClosingAction.action === 'closeModals') {
        closeStackItems(pendingClosingAction.modalName, pendingClosingAction.callback)
      } else if (pendingClosingAction.action === 'closeAllModals') {
        closeAllStackItems(pendingClosingAction.callback)
      }
    }
  }, [closeAllStackItems, closeStackItem, closeStackItems, pendingClosingAction])

  return (
    <Animated.View pointerEvents="box-none" style={[styles.container, containerStyle, { justifyContent, zIndex }]}>
      {renderAnimatedComponent()}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
})

export default memo(
  StackItem,
  (prevProps, nextProps) =>
    prevProps.position === nextProps.position &&
    prevProps.stackItem.hash === nextProps.stackItem.hash &&
    prevProps.isLastOpenedModal === nextProps.isLastOpenedModal &&
    prevProps.isFirstVisibleModal === nextProps.isFirstVisibleModal &&
    prevProps.pendingClosingAction === nextProps.pendingClosingAction &&
    prevProps.wasOpenCallbackCalled === nextProps.wasOpenCallbackCalled &&
    prevProps.wasClosedByBackdropPress === nextProps.wasClosedByBackdropPress,
)
