import React, { useEffect, useRef, memo } from 'react'
import { Animated, StyleSheet } from 'react-native'
import {
  useMemoOne as useMemo,
  useCallbackOne as useCallback,
} from 'use-memo-one'
import {
  State,
  Directions,
  FlingGestureHandler,
} from 'react-native-gesture-handler'

import {
  ModalEventCallback,
  ModalEventName,
  ModalStackItem,
  ModalfyParams,
  SharedProps,
} from '../types'

import { getStackItemOptions, vh } from '../utils'

type Props<P> = SharedProps<P> & {
  wasClosedByBackdropPress: boolean
  stackItem: ModalStackItem<P>
  position: number
  zIndex: number
}

const StackItem = <P extends ModalfyParams>({
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
      closeModalCallback?: (stackItem: ModalStackItem<P>) => void,
    ) => {
      if (!shouldAnimateOut) closeModalCallback?.(stackItem)

      if (animationIn && !closeModalCallback) {
        animationIn(animatedValue, toValue)
      } else if (animationOut && closeModalCallback) {
        animationOut(animatedValue, toValue)
      } else {
        Animated.timing(animatedValue, {
          toValue,
          useNativeDriver: true,
          ...(closeModalCallback ? animateOutConfig : animateInConfig),
        }).start()
      }

      // Using `finished` provided by Animated.timing().start() callback
      // doesn't hide the backdrop fast enough to get a please animation,
      // hence the use of this little hack.
      const timeout = setTimeout(() => {
        closeModalCallback?.(stackItem)
        clearTimeout(timeout)
      }, Math.max(1, Number(animateOutConfig?.duration) * 0.5))
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
    (closingElement) => {
      if (closingElement === currentModal) {
        updateAnimatedValue(position - 1, () => closeModal(closingElement))
      } else closeModal(closingElement)
    },
    [closeModal, currentModal, position, updateAnimatedValue],
  )

  const closeAllStackItems = useCallback(() => {
    updateAnimatedValue(position - 1, closeAllModals)
  }, [closeAllModals, position, updateAnimatedValue])

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

  const renderAnimatedComponent = (): JSX.Element => {
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
                closeModals,
                addListener,
                currentModal,
                removeAllListeners,
                closeModal: closeStackItem,
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
    prevProps.wasClosedByBackdropPress === nextProps.wasClosedByBackdropPress,
)
