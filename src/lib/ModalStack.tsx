import React, { useEffect, useState } from 'react'
import { useCallback, useMemo } from 'use-memo-one'
import { Easing, Animated, StyleSheet, TouchableWithoutFeedback, Platform } from 'react-native'

import type {
  SharedProps,
  ModalOptions,
  ModalfyParams,
  ModalStackItem,
  ModalStackOptions,
  ModalPendingClosingAction,
  ModalStackSavedStackItemsOptions,
} from '../types'

import StackItem from './StackItem'

import { computeUpdatedModalOptions, defaultOptions, getStackItemOptions, queueMacroTask, sh } from '../utils'

type Props<P extends ModalfyParams> = SharedProps<P>

const ModalStack = <P extends ModalfyParams>(props: Props<P>) => {
  const { stack } = props

  const [hasChangedBackdropColor, setBackdropColorStatus] = useState(false)

  const [backdropClosedItems, setBackdropClosedItems] = useState<string[]>([])

  const [openActionCallbacks, setOpenActionCallbacks] = useState<string[]>([])

  const [stackStatus, setStackStatus] = useState<'idle' | 'shown' | 'hiding' | 'hidden'>('idle')

  const [savedStackItemsOptions, setSavedStackItemsOptions] = useState<ModalStackSavedStackItemsOptions<P>>({})

  const [
    { backBehavior, backdropColor, backdropOpacity, backdropPosition, stackContainerStyle, backdropAnimationDuration },
    setModalStackOptions,
  ] = useState<ModalStackOptions>(getStackItemOptions(Array.from(stack.openedItems).pop(), stack))

  const canShowStack = stackStatus === 'hiding' || stackStatus === 'shown'

  const { opacity, translateY } = useMemo(
    () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(sh(100)),
    }),
    [],
  )

  const getStackContainerStyle = () => {
    if (typeof stackContainerStyle === 'object') return stackContainerStyle
    else if (typeof stackContainerStyle === 'function') return stackContainerStyle(opacity)
    return {}
  }

  const hideBackdrop = useCallback(() => {
    if (stackStatus === 'shown') {
      setStackStatus('hiding')
      Animated.timing(opacity, {
        toValue: 0,
        easing: Easing.inOut(Easing.ease),
        duration: backdropAnimationDuration,
        useNativeDriver: true,
      }).start(() => {
        queueMacroTask(() => {
          setStackStatus('hidden')
          setBackdropClosedItems([])
          translateY.setValue(sh(100))
        })
      })
    }
  }, [backdropAnimationDuration, opacity, translateY, stackStatus])

  const onSetModalStackOptions = useCallback((newModalOptions: ModalOptions) => {
    queueMacroTask(() => {
      setModalStackOptions(
        computeUpdatedModalOptions(
          'modalStack',
          newModalOptions,
          getStackItemOptions(Array.from(stack.openedItems).pop(), stack),
        ),
      )
    })
  }, [])

  const resetModalStackOptions = useCallback(() => {
    queueMacroTask(() => {
      setModalStackOptions(getStackItemOptions(Array.from(stack.openedItems).pop(), stack))
    })
  }, [])

  const renderStackItem = (stackItem: ModalStackItem<P>, index: number) => {
    const position = stack.openedItems.size - index
    const isBackdropBelowLatestModal = backdropPosition === 'belowLatest'

    const isNotLatestOpenedModal = position >= 2
    const isFirstVisibleModal = position === stack.openedItems.size
    const isLastOpenedModal = position === 1 && stack.openedItems.size === 1

    const pendingClosingAction: ModalPendingClosingAction | undefined = stack.pendingClosingActions
      .values()
      .next().value
    const hasPendingClosingAction = position === 1 && pendingClosingAction?.currentModalHash === stackItem.hash

    return (
      <StackItem
        {...props}
        // @ts-ignore
        stackItem={stackItem}
        key={index}
        position={position}
        hideBackdrop={hideBackdrop}
        openModal={(...args) => {
          // @ts-ignore
          props.openModal(...args)
          setOpenActionCallbacks(state => [...state, stackItem.hash])
        }}
        isLastOpenedModal={isLastOpenedModal}
        isFirstVisibleModal={isFirstVisibleModal}
        setModalStackOptions={onSetModalStackOptions}
        savedStackItemsOptions={savedStackItemsOptions}
        setSavedStackItemsOptions={setSavedStackItemsOptions}
        wasOpenCallbackCalled={openActionCallbacks.includes(stackItem.hash)}
        wasClosedByBackdropPress={backdropClosedItems.includes(stackItem.hash)}
        zIndex={isBackdropBelowLatestModal && isNotLatestOpenedModal ? -1 : index + 1}
        pendingClosingAction={hasPendingClosingAction ? pendingClosingAction : undefined}
      />
    )
  }

  const renderStack = () => {
    if (!stack.openedItems.size) return null
    return [...stack.openedItems].map(renderStackItem)
  }

  const onBackdropPress = () => {
    if (backBehavior === 'none') return

    const currentItem = [...stack.openedItems].slice(-1)[0]

    setBackdropClosedItems([...backdropClosedItems, currentItem?.hash])
  }

  const renderBackdrop = () => {
    const onPress = () => onBackdropPress()
    const isBackdropBelowLatestModal = backdropPosition === 'belowLatest'
    const backgroundColor =
      stack.openedItems.size && backdropColor ? backdropColor : hasChangedBackdropColor ? 'transparent' : 'black'

    return (
      <TouchableWithoutFeedback style={isBackdropBelowLatestModal && { zIndex: 0 }} onPress={onPress}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor,
              opacity: opacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, backdropOpacity ?? defaultOptions.backdropOpacity!],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>
    )
  }

  useEffect(() => {
    resetModalStackOptions()
  }, [stack.openedItems.size])

  useEffect(() => {
    if (stack.openedItems.size && backdropColor && backdropColor !== 'black' && !hasChangedBackdropColor) {
      setBackdropColorStatus(true)
    }
  }, [backdropColor, hasChangedBackdropColor, stack.openedItems.size])

  useEffect(() => {
    const scrollY = Platform.OS === 'web' ? window.scrollY ?? document.documentElement.scrollTop : 0
    if (stack.openedItems.size) {
      setStackStatus('shown')
      translateY.setValue(scrollY)
      Animated.timing(opacity, {
        toValue: 1,
        easing: Easing.in(Easing.ease),
        duration: backdropAnimationDuration,
        useNativeDriver: true,
      }).start()
    } else hideBackdrop()
  }, [backdropAnimationDuration, opacity, stack.openedItems.size, translateY])

  return canShowStack ? (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
        Platform.OS === 'web' && stack.openedItems.size ? styles.containerWeb : null,
        getStackContainerStyle(),
      ]}>
      {renderBackdrop()}
      {renderStack()}
    </Animated.View>
  ) : null
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      android: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
      },
      ios: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
      },
    }),
  },
  containerWeb: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    height: '100vh',
    width: '100vw',
    zIndex: 0,
    // mobile viewport units bug fix
    maxHeight: '-webkit-fill-available',
    maxWidth: '-webkit-fill-available',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
})

export default ModalStack
