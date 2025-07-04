import {
  Gesture,
  Directions,
  GestureDetector,
  GestureStateChangeEvent,
  FlingGestureHandlerEventPayload,
} from 'react-native-gesture-handler'
import { useMemo, useCallback } from 'use-memo-one'
import { Animated, StyleSheet, ViewProps, ViewStyle } from 'react-native'
import React, { ReactNode, useEffect, useRef, memo, useState } from 'react'

import type {
  SharedProps,
  ModalOptions,
  ModalfyParams,
  ModalStackItem,
  ModalEventName,
  ModalEventCallback,
  ModalStackItemOptions,
  ModalPendingClosingAction,
  ModalOnCloseEventCallback,
  ModalOnAnimateEventCallback,
  ModalStackSavedStackItemsOptions,
} from '../types'

import { computeUpdatedModalOptions, queueMacroTask, getStackItemOptions, validateStackItemOptions, vh } from '../utils'

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
  setModalStackOptions: (modalOptions: ModalOptions) => void
  savedStackItemsOptions: ModalStackSavedStackItemsOptions<P>
  setSavedStackItemsOptions: React.Dispatch<React.SetStateAction<Props<P>['savedStackItemsOptions']>>
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
  setModalStackOptions,
  pendingClosingAction,
  wasOpenCallbackCalled,
  savedStackItemsOptions,
  wasClosedByBackdropPress,
  setSavedStackItemsOptions,
}: Props<P>) => {
  const [
    {
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
    },
    setModalOptions,
  ] = useState<ModalStackItemOptions>(getStackItemOptions(stackItem, stack))

  let localStackItemOptionsCache: ModalOptions

  const { animatedValue, translateY } = useMemo(
    () => ({
      translateY: new Animated.Value(0),
      animatedValue: new Animated.Value(-1),
    }),
    [],
  )

  const onCloseListener = useRef<ModalOnCloseEventCallback>(() => undefined)

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
          queueMacroTask(stackItemCallback)
        })
      } else {
        Animated.timing(animatedValue, {
          toValue,
          useNativeDriver: true,
          ...(internalClosingCallback ? animateOutConfig : animateInConfig),
        }).start(() => {
          queueMacroTask(() => {
            internalClosingCallback?.(stackItem)
            stackItemCallback?.()
          })
        })
      }
    },
    [stackItem, animationIn, animationOut, animatedValue, animateInConfig, animateOutConfig],
  )

  const setStackItemModalOptions = useCallback(
    (newModalOptions: ModalOptions) => {
      if (position !== 1) return
      if (!newModalOptions || !Object.keys(newModalOptions).length) {
        throw new Error(`'${stackItem.name}' setModalOptions expects an object with valid modal options. For instance:

...

useEffect(() => {
  setModalOptions({
    backBehavior: 'clear',
    disableFlingGesture: true,
  })
}, [])`)
      }

      localStackItemOptionsCache = newModalOptions
      setSavedStackItemsOptions({ [stackItem.hash]: newModalOptions })

      queueMacroTask(() => {
        setModalOptions(computeUpdatedModalOptions('stackItem', newModalOptions, getStackItemOptions(stackItem, stack)))
      })

      queueMacroTask(() => setModalStackOptions(newModalOptions), 1)
    },
    [position, savedStackItemsOptions[stackItem.hash]],
  )

  const resetStackItemModalOptions = useCallback(() => {
    if (!localStackItemOptionsCache && !savedStackItemsOptions[stackItem.hash]) {
      setModalOptions(getStackItemOptions(stackItem, stack))
    }
  }, [])

  const closeStackItem = useCallback(
    (modalName, callback?: () => void) => {
      if (isLastOpenedModal) hideBackdrop()
      else resetStackItemModalOptions()

      updateAnimatedValue(position - 1, () => {
        onCloseListener.current({ type: 'closeModal', origin: wasClosedByBackdropPress ? 'backdrop' : 'default' })
        closeModal(modalName)
        if (pendingClosingAction?.action === 'closeModal') removeClosingAction(pendingClosingAction)
        queueMacroTask(callback)
      })
    },
    [
      position,
      closeModal,
      currentModal,
      hideBackdrop,
      onCloseListener,
      updateAnimatedValue,
      pendingClosingAction,
      wasClosedByBackdropPress,
    ],
  )

  const closeStackItems = useCallback(
    (closingElement, callback?: () => void) => {
      if (isLastOpenedModal) hideBackdrop()
      else resetStackItemModalOptions()

      return updateAnimatedValue(position - 1, () => {
        onCloseListener.current({ type: 'closeModals', origin: 'default' })
        let output = closeModals(closingElement)
        if (pendingClosingAction?.action === 'closeModals') removeClosingAction(pendingClosingAction)
        queueMacroTask(callback)
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
        queueMacroTask(callback)
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
          }).start(() => queueMacroTask(onAnimationEnd))
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

  const renderAnimatedComponent = (): ReactNode => {
    const Component = stackItem.component
    const addListener = (eventName: ModalEventName, handler: ModalEventCallback) =>
      registerListener(stackItem.hash, eventName, handler)
    const removeAllListeners = () => clearListeners(stackItem.hash)

    return (
      <Animated.View pointerEvents={pointerEvents} style={{ transform: [{ translateY }] }}>
        <GestureDetector
          gesture={Gesture.Fling()
            .enabled(!disableFlingGesture)
            .direction(verticalPosition === 'top' ? Directions.UP : Directions.DOWN)
            .onEnd(onFling)
            .runOnJS(true)}>
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
                setModalOptions: setStackItemModalOptions,
                getParam: <N extends keyof P[NonNullable<typeof currentModal>]>(
                  paramName: N,
                  defaultValue?: P[NonNullable<typeof currentModal>][N],
                ): P[NonNullable<NonNullable<typeof currentModal>>][N] | undefined =>
                  getParam(stackItem.hash, paramName, defaultValue),
                ...(stackItem.params && { params: stackItem.params }),
              }}
            />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    )
  }

  useEffect(() => {
    const stackItemOption = <K extends keyof ModalOptions>(key: K): ModalOptions[K] =>
      stackItem?.component.modalOptions?.[key] ?? stackItem?.options?.[key]

    validateStackItemOptions({
      animationIn: stackItemOption('animationIn'),
      animationOut: stackItemOption('animationOut'),
      animateInConfig: stackItemOption('animateInConfig'),
      animateOutConfig: stackItemOption('animateOutConfig'),
    })
  }, [])

  useEffect(() => {
    let onAnimateListener: ModalOnAnimateEventCallback | undefined = undefined

    if (transitionOptions && typeof transitionOptions !== 'function') {
      throw new Error(`'${stackItem.name}' transitionOptions should be a function. For instance:
import ${stackItem.name} from './src/modals/${stackItem.name}';
import ModalStack from '../../lib/module/lib/ModalStack';

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
},`)
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

  useEffect(() => {
    if (position === 1) {
      resetStackItemModalOptions()
    }
  }, [position])

  useEffect(() => {
    if (position === 1 && savedStackItemsOptions[stackItem.hash]) {
      setStackItemModalOptions(localStackItemOptionsCache ?? savedStackItemsOptions[stackItem.hash])
    }
  }, [savedStackItemsOptions[stackItem.hash], position, stackItem.hash])

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
