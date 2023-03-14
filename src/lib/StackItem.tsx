import { useMemo, useCallback } from 'use-memo-one'
import React, { ReactNode, useEffect, useRef, memo } from 'react'
import { Animated, StyleSheet, ViewProps, ViewStyle } from 'react-native'
import { State, Directions, FlingGestureHandler } from 'react-native-gesture-handler'

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

type Props<P> = SharedProps<P> & {
  zIndex: number
  position: number
  stackItem: ModalStackItem<P>
  wasOpenCallbackCalled: boolean
  wasClosedByBackdropPress: boolean
  pendingClosingAction?: ModalPendingClosingAction
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
  closeAllModals,
  eventListeners,
  clearListeners,
  registerListener,
  removeClosingAction,
  pendingClosingAction,
  wasOpenCallbackCalled,
  wasClosedByBackdropPress,
}: Props<P>) => {
  const { animatedValue, translateY } = useMemo(
    () => ({
      animatedValue: new Animated.Value(-1),
      translateY: new Animated.Value(0),
    }),
    [],
  )

  const animatedListenerId = useRef<string | undefined>()
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
    let onAnimateListener: ModalOnAnimateEventCallback = () => undefined

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

    animatedListenerId.current = animatedValue.addListener(({ value }) => onAnimateListener(value))

    return () => {
      animatedValue.removeAllListeners()
      clearListeners(stackItem.hash)
    }
  }, [])

  const updateAnimatedValue = useCallback(
    (
      toValue: number,
      closeModalCallback?: (closingElement: ModalStackItem<P>) => void,
      modalStackItemCallback?: () => void,
    ) => {
      if (!closeModalCallback && animationIn) {
        animationIn(animatedValue, toValue, modalStackItemCallback)
      } else if (closeModalCallback && animationOut) {
        animationOut(animatedValue, toValue, () => {
          closeModalCallback(stackItem)
          modalStackItemCallback?.()
        })
      } else {
        Animated.timing(animatedValue, {
          toValue,
          useNativeDriver: true,
          ...(closeModalCallback ? animateOutConfig : animateInConfig),
        }).start(({ finished }) => {
          if (finished) {
            closeModalCallback?.(stackItem)
            modalStackItemCallback?.()
          }
        })
      }
    },
    [stackItem, animationIn, animationOut, animatedValue, animateInConfig, animateOutConfig],
  )

  const closeStackItem = useCallback(
    (modalName, callback?: () => void) => {
      const onCloseFns = () => {
        onCloseListener.current({ type: 'closeModal', origin: wasClosedByBackdropPress ? 'backdrop' : 'default' })
        closeModal(modalName)
        callback?.()
      }

      if (!modalName || modalName === currentModal) {
        updateAnimatedValue(position - 1, onCloseFns)
      } else onCloseFns()
    },
    [
      currentModal,
      closeModal,
      onCloseListener,
      position,
      stack.openedItemsSize,
      updateAnimatedValue,
      wasClosedByBackdropPress,
    ],
  )

  const closeStackItems = useCallback(
    (closingElement, callback?: () => void) => {
      const onCloseFns = () => {
        onCloseListener.current({ type: 'closeModals', origin: 'default' })
        let output = closeModals(closingElement)
        callback?.()
        return output
      }

      if (closingElement === currentModal && position === 1) {
        return updateAnimatedValue(position - 1, onCloseFns)
      } else return onCloseFns()
    },
    [closeModals, currentModal, position, stack.openedItemsSize, updateAnimatedValue],
  )

  const closeAllStackItems = useCallback(
    (callback?: () => void) => {
      updateAnimatedValue(position - 1, () => {
        onCloseListener.current({ type: 'closeAllModals', origin: wasClosedByBackdropPress ? 'backdrop' : 'default' })
        closeAllModals()
        callback?.()
      })
    },
    [closeAllModals, position, stack.openedItemsSize, updateAnimatedValue, wasClosedByBackdropPress],
  )

  const onFling = useCallback(
    ({ nativeEvent }) => {
      if (!disableFlingGesture && nativeEvent.oldState === State.ACTIVE) {
        const toValue = verticalPosition === 'top' ? vh(-100) : vh(100)

        Animated.timing(translateY, {
          toValue,
          useNativeDriver: true,
          ...animateOutConfig,
        }).start(({ finished }) => {
          if (finished) {
            onCloseListener.current({ type: 'closeModal', origin: 'fling' })
            closeModal(stackItem)
          }
        })
      }
    },
    [animateOutConfig, closeModal, disableFlingGesture, stack.openedItemsSize, stackItem, translateY, verticalPosition],
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
        return position === 1 ? 'box-only' : 'box-none'
      case 'current-modal-only':
        return position === 1 ? 'box-none' : 'box-only'
      case 'auto':
      default:
        return 'box-none'
    }
  }, [pointerEventsBehavior, position])

  const renderAnimatedComponent = (): ReactNode => {
    const Component = stackItem.component
    const addListener = (eventName: ModalEventName, handler: ModalEventCallback) =>
      registerListener(stackItem.hash, eventName, handler)
    const removeAllListeners = () => clearListeners(stackItem.hash)

    return (
      <Animated.View pointerEvents={pointerEvents} style={{ transform: [{ translateY }] }}>
        <FlingGestureHandler
          direction={verticalPosition === 'top' ? Directions.UP : verticalPosition === 'bottom' ? Directions.DOWN : -1}
          onHandlerStateChange={onFling}>
          <Animated.View
            style={{
              ...(transitionOptions && transitionOptions(animatedValue)),
            }}>
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
        </FlingGestureHandler>
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
    if (wasClosedByBackdropPress) {
      if (backBehavior === 'clear') closeAllStackItems()
      else closeStackItem(undefined)
    }
  }, [
    backBehavior,
    closeAllStackItems,
    closeStackItem,
    position,
    stackItem.callback,
    updateAnimatedValue,
    wasClosedByBackdropPress,
    wasOpenCallbackCalled,
  ])

  useEffect(() => {
    if (pendingClosingAction) {
      if (pendingClosingAction.action === 'closeModal') {
        closeStackItem(pendingClosingAction.modalName, pendingClosingAction.callback)
      } else if (pendingClosingAction.action === 'closeModals') {
        closeStackItems(pendingClosingAction.modalName, pendingClosingAction.callback)
      } else if (pendingClosingAction.action === 'closeAllModals') {
        closeAllStackItems(pendingClosingAction.callback)
      }

      removeClosingAction(pendingClosingAction)
    }
  }, [closeAllStackItems, closeStackItem, closeStackItems, pendingClosingAction, removeClosingAction])

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
    prevProps.pendingClosingAction === nextProps.pendingClosingAction &&
    prevProps.wasOpenCallbackCalled === nextProps.wasOpenCallbackCalled &&
    prevProps.wasClosedByBackdropPress === nextProps.wasClosedByBackdropPress,
)
