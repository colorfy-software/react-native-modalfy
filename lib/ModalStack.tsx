import React, { useEffect, useState, memo } from 'react'
import {
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Easing,
  Platform
} from 'react-native'
import { useMemo } from 'use-memo-one'
import ExtraDimensions from 'react-native-extra-dimensions-android'

import { ModalfyParams, ModalStackItem, SharedProps } from '../types'

import StackItem from './StackItem'

import { getStackItemOptions, vh } from '../utils'

type Props<P> = SharedProps<P>

type State<P> = {
  backdropClosedItems: string[]
  openedItemsArray: ModalStackItem<P>[]
}

const ModalStack = <P extends ModalfyParams>(props: Props<P>) => {
  const { stack } = props

  const [hasChangedBackdropColor, setBackdropColorStatus] = useState<boolean>(
    false,
  )

  const [backdropClosedItems, setBackdropClosedItems] = useState<string[]>([])

  const [openedItemsArray, setOpenedItemsArray] = useState<
    State<P>['openedItemsArray']
  >([...stack.openedItems])

  const { opacity, translateY } = useMemo(
    () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(Platform.OS === 'android' ? ExtraDimensions.getRealWindowHeight() : vh(100)),
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
      }).start()
      translateY.setValue(Platform.OS === 'android' ? ExtraDimensions.getRealWindowHeight() : vh(100))
    }
  }, [openedItemsArray.length, stack.openedItems.size, translateY, opacity])

  useEffect(() => {
    if (stack.openedItemsSize !== openedItemsArray.length) {
      setOpenedItemsArray([...stack.openedItems])
    }
  }, [openedItemsArray.length, stack.openedItems, stack.openedItemsSize])

  const renderStackItem = (stackItem: ModalStackItem<P>, index: number) => (
    <StackItem
      {...props}
      // @ts-ignore
      stackItem={stackItem}
      key={index}
      zIndex={index + 1}
      position={openedItemsArray.length - index}
      wasClosedByBackdropPress={backdropClosedItems.includes(stackItem.hash)}
    />
  )

  const renderStack = () => {
    if (!openedItemsArray.length) return null
    return openedItemsArray.map(renderStackItem)
  }

  const onBackdropPress = () => {
    if (backBehavior === 'none') return

    const currentItem = openedItemsArray.slice(-1)[0]
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
    prevProps.stack.openedItemsSize === nextProps.stack.openedItemsSize,
)
