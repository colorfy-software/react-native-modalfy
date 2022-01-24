import React, { ReactNode, useEffect, useRef, memo } from 'react'
import { Animated, StyleSheet } from 'react-native'
import { useMemo, useCallback } from 'use-memo-one'
import {
  State,
  Directions,
  FlingGestureHandler,
} from 'react-native-gesture-handler'

import {
  ModalEventCallback,
  ModalPendingClosingAction,
  ModalStackItem,
  ModalfyParams,
  SharedProps,
} from '../types'

import { getStackItemOptions, vh } from '../utils'

type Props<P> = SharedProps<P> & {
  wasClosedByBackdropPress: boolean
  pendingClosingAction?: ModalPendingClosingAction
  position: number
  zIndex: number
}

const StackItem = <P extends ModalfyParams>({
  pendingClosingAction,
  wasClosedByBackdropPress,
  registerListener,
  clearListeners,
  eventListeners,
  closeAllModals,
  currentModal,
  closeModals,
  closeModal,
  openModal,
  stackItem,
  position,
  getParam,
  zIndex,
  stack,
}: Props<P>) => {
  const { animatedValue, translateY } = useMemo(
    () => ({
      animatedValue: new Animated.Value(-1),
      translateY: new Animated.Value(0),
    }),
    [],
  )

  const animatedListenerId = useRef<string | undefined>()

  const {
    position: verticalPosition,
    disableFlingGesture,
    transitionOptions,
    animateOutConfig,
    shouldAnimateOut,
    animateInConfig,
    containerStyle,
    backBehavior,
    animationOut,
    animationIn,
  } = useMemo(() => getStackItemOptions(stackItem, stack), [stack, stackItem])

  useEffect(() => {
    let handleAnimatedListener: ModalEventCallback = () => undefined

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

    eventListeners.forEach((item) => {
      if (item.event === `${stackItem.hash}_onAnimate`) {
        handleAnimatedListener = item.handler
      }
    })

    animatedListenerId.current = animatedValue.addListener(({ value }) =>
      handleAnimatedListener(value),
    )

    updateAnimatedValue(1)

    return () => {
      animatedValue.removeAllListeners()
      clearListeners(stackItem.hash)
    }

    // Should only be triggered on initial mount and return when unmounted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateAnimatedValue = useCallback(
    (
      toValue: number,
      closeModalCallback?: (closingElement: ModalStackItem<P>) => void,
    ) => {
      if (!shouldAnimateOut) closeModalCallback?.(stackItem)
      if (!closeModalCallback && animationIn) {
        animationIn(animatedValue, toValue)
      } else if (closeModalCallback && animationOut) {
        animationOut(animatedValue, toValue, () => {
          closeModalCallback(stackItem)
        })
      } else {
        Animated.timing(animatedValue, {
          toValue,
          useNativeDriver: true,
          ...(closeModalCallback ? animateOutConfig : animateInConfig),
        }).start(({ finished }) => {
          if (finished) {
            closeModalCallback?.(stackItem)
        clearTimeout(timeout)
          }
        })
      }
    },
    [
      animationIn,
      animateInConfig,
      animationOut,
      animateOutConfig,
      animatedValue,
      shouldAnimateOut,
      stackItem,
    ],
  )

  const closeStackItem = useCallback(
    (modalName) => {
      if (!modalName || modalName === currentModal) {
        updateAnimatedValue(position - 1, () => {
          closeModal(modalName)
        })
      } else {
        closeModal(modalName)
      }
    },
    [closeModal, currentModal, position, updateAnimatedValue],
  )

  const closeStackItems = useCallback(
    (closingElement) => {
      if (closingElement === currentModal && position === 1) {
        return updateAnimatedValue(position - 1, () => {
          const output = closeModals(closingElement)
          return output
        })
      }
      const output = closeModals(closingElement)
      return output
    },
    [closeModals, currentModal, position, updateAnimatedValue],
  )

  const closeAllStackItems = useCallback(
    () =>
      updateAnimatedValue(position - 1, () => {
        closeAllModals()
      }),
    [closeAllModals, position, updateAnimatedValue],
  )

  const onFling = useCallback(
    ({ nativeEvent }) => {
      if (!disableFlingGesture && nativeEvent.oldState === State.ACTIVE) {
        const toValue = verticalPosition === 'top' ? vh(-100) : vh(100)

        Animated.timing(translateY, {
          toValue,
          useNativeDriver: true,
          ...animateOutConfig,
        }).start()

        const timeout = setTimeout(() => {
          closeModal(stackItem)
          clearTimeout(timeout)
        }, Math.max(1, Number(animateOutConfig?.duration) * 0.5))
      }
    },
    [
      animateOutConfig,
      closeModal,
      disableFlingGesture,
      stackItem,
      translateY,
      verticalPosition,
    ],
  )

  const renderAnimatedComponent = (): ReactNode => {
    const Component = stackItem.component
    const addListener = (eventName: ModalEventName, handler: () => void) =>
      registerListener(stackItem.hash, eventName, handler)
    const removeAllListeners = () => clearListeners(stackItem.hash)

    return (
      <Animated.View
        pointerEvents="box-none"
        style={{ transform: [{ translateY }] }}>
        <FlingGestureHandler
          direction={
            verticalPosition === 'top'
              ? Directions.UP
              : verticalPosition === 'bottom'
              ? Directions.DOWN
              : -1
          }
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
                ):
                  | P[NonNullable<NonNullable<typeof currentModal>>][N]
                  | undefined =>
                  getParam(stackItem.hash, paramName, defaultValue),
                ...(stackItem.params && { params: stackItem.params }),
              }}
            />
          </Animated.View>
        </FlingGestureHandler>
      </Animated.View>
    )
  }

  const justifyContent = useMemo(() => {
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
    updateAnimatedValue(position)
    if (wasClosedByBackdropPress) {
      if (backBehavior === 'clear') closeAllStackItems()
      else closeStackItem(undefined)
    }
  }, [
    backBehavior,
    closeAllStackItems,
    closeStackItem,
    position,
    updateAnimatedValue,
    wasClosedByBackdropPress,
  ])

  useEffect(() => {
    if (pendingClosingAction) {
      if (pendingClosingAction.action === 'closeModal') {
        closeStackItem(
          pendingClosingAction.modalName,
          pendingClosingAction.callback,
        )
      } else if (pendingClosingAction.action === 'closeModals') {
        closeStackItems(
          pendingClosingAction.modalName,
          pendingClosingAction.callback,
        )
      } else if (pendingClosingAction.action === 'closeAllModals') {
        closeAllStackItems(pendingClosingAction.callback)
      }

      removeClosingAction(pendingClosingAction)
    }
  }, [
    closeAllStackItems,
    closeStackItem,
    closeStackItems,
    pendingClosingAction,
    removeClosingAction,
  ])

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, containerStyle, { justifyContent, zIndex }]}>
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
    prevProps.wasClosedByBackdropPress === nextProps.wasClosedByBackdropPress,
)
