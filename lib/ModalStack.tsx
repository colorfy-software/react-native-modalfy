import React, { useEffect, useState, memo } from 'react'
import {
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { useMemo } from 'use-memo-one'

import {
  SharedProps,
  ModalfyParams,
  ModalStackItem,
  ModalPendingClosingAction,
} from '../types'

import StackItem from './StackItem'

import { getStackItemOptions, sh } from '../utils'

type Props<P> = SharedProps<P>

const ModalStack = <P extends ModalfyParams>(props: Props<P>) => {
  const { stack } = props

  const [hasChangedBackdropColor, setBackdropColorStatus] = useState(false)

  const [backdropClosedItems, setBackdropClosedItems] = useState<string[]>([])

  const [openActionCallbacks, setOpenActionCallbacks] = useState<string[]>([])

  const { opacity, translateY } = useMemo(
    () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(sh(100)),
    }),
    [],
  )

  const { backBehavior, backdropColor, backdropOpacity } = useMemo(
    () => getStackItemOptions(Array.from(stack.openedItems).pop(), stack),
    [stack],
  )

  useEffect(() => {
    if (
      stack.openedItemsSize &&
      backdropColor &&
      backdropColor !== 'black' &&
      !hasChangedBackdropColor
    ) {
      setBackdropColorStatus(true)
    }
  }, [backdropColor, hasChangedBackdropColor, stack.openedItemsSize])

  useEffect(() => {
    const hasOpenedItemsNow = stack.openedItems.size
    const hadOpenedItemsBefore = openedItemsArray.length

    if (hasOpenedItemsNow) {
      translateY.setValue(0)
      Animated.timing(opacity, {
        toValue: 1,
        easing: Easing.in(Easing.ease),
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else if (hadOpenedItemsBefore && !hasOpenedItemsNow) {
      Animated.timing(opacity, {
        toValue: 0,
        easing: Easing.inOut(Easing.ease),
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) translateY.setValue(sh(100))
      })
    }
  }, [openedItemsArray.length, stack.openedItems.size, translateY, opacity])

  const renderStackItem = (stackItem: ModalStackItem<P>, index: number) => {
    const position = stack.openedItemsSize - index
    const pendingClosingAction: ModalPendingClosingAction | undefined =
      stack.pendingClosingActions.values().next().value
    const hasPendingClosingAction =
      position === 1 &&
      pendingClosingAction?.currentModalHash === stackItem.hash
    return (
      <StackItem
        {...props}
        // @ts-ignore
        stackItem={stackItem}
        key={index}
        zIndex={index + 1}
        position={position}
        openModal={(...args) => {
          // @ts-ignore
          props.openModal(...args)
          setOpenActionCallbacks((state) => [...state, stackItem.hash])
        }}
        wasOpenCallbackCalled={openActionCallbacks.includes(stackItem.hash)}
        wasClosedByBackdropPress={backdropClosedItems.includes(stackItem.hash)}
        pendingClosingAction={
          hasPendingClosingAction ? pendingClosingAction : undefined
        }
      />
    )
  }

  const renderStack = () => {
    if (!stack.openedItemsSize) return null
    return [...stack.openedItems].map(renderStackItem)
  }

  const onBackdropPress = () => {
    if (backBehavior === 'none') return

    const currentItem = [...stack.openedItems].slice(-1)[0]

    if (stack.openedItemsSize === 1) {
      Animated.timing(opacity, {
        toValue: 0,
        easing: Easing.inOut(Easing.ease),
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) translateY.setValue(sh(100))
      })
    }

    setBackdropClosedItems([...backdropClosedItems, currentItem?.hash])
  }

  const renderBackdrop = () => {
    const onPress = () => onBackdropPress()
    const backgroundColor =
      stack.openedItemsSize && backdropColor
        ? backdropColor
        : hasChangedBackdropColor
        ? 'transparent'
        : 'black'

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor,
              opacity: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, backdropOpacity ?? 0.6],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>
    )
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      {renderStack()}
      {renderBackdrop()}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
})

export default memo(
  ModalStack,
  (prevProps, nextProps) =>
    prevProps.stack.openedItemsSize === nextProps.stack.openedItemsSize &&
    prevProps.stack.pendingClosingActionsSize ===
      nextProps.stack.pendingClosingActionsSize,
)
