/* @flow */

import React, { PureComponent } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'

import type {
  EventCallback,
  EventName,
  EventSubscription,
  ModalEventListeners,
  ModalListener,
  ModalName,
  Stack,
  StackItem as StackItemType,
  TransitionOptions,
} from '../types'

import { getStackItemOptions } from '../utils'

type Props = {
  clearListeners: (hash: string) => void,
  closeAllModals: (modal: ModalName) => void,
  closeModal: (stackItem: StackItemType) => void,
  currentModal: ?ModalName,
  eventListeners: ModalEventListeners,
  getParams: (hash: ?string, fallback: any) => any,
  openModal: ModalName => void,
  position: number,
  registerListener: (
    hash: string,
    eventName: EventName,
    handler: () => void
  ) => EventSubscription,
  stack: Stack<Set<StackItemType>>,
  stackItem: StackItemType,
  zIndex: number,
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
})

class StackItem extends PureComponent<Props> {
  animatedValue = new Animated.Value(-1)
  animatedListenerId: string

  componentDidMount() {
    const { eventListeners, stack, stackItem } = this.props
    const { transitionOptions } = getStackItemOptions(stackItem, stack)
    let handleAnimatedListener: EventCallback = () => undefined

    if (transitionOptions && typeof transitionOptions !== 'function') {
      throw new Error(`'${
        stackItem.name
      }' transitionOptions should be a function. For example:
      import ${stackItem.name} from '@modals/${stackItem.name}';

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
      if (item.event === `${stackItem.hash}_onAnimate`)
        handleAnimatedListener = item.handler
    })

    this.animatedListenerId = this.animatedValue.addListener(({ value }) =>
      handleAnimatedListener(value)
    )
    this._updateAnimatedValue(1)
  }

  shouldComponentUpdate(nextProps: Props) {
    if (this.props.position !== nextProps.position) return true
    return false
  }

  componentDidUpdate() {
    this._updateAnimatedValue(this.props.position)
  }

  componentWillUnmount() {
    this.animatedValue.removeAllListeners()
  }

  _updateAnimatedValue = (
    toValue: number,
    closeModal?: (stackItem: StackItemType) => void
  ) => {
    const { stack, stackItem } = this.props
    const {
      animateInConfig,
      animateOutConfig,
      shouldAnimateOut,
    } = getStackItemOptions(stackItem, stack)

    if (!shouldAnimateOut) closeModal?.(stackItem)

    Animated.timing(this.animatedValue, {
      toValue,
      useNativeDriver: true,
      ...(closeModal ? animateOutConfig : animateInConfig),
    }).start(({ finished }) => {
      if (finished && closeModal && shouldAnimateOut) closeModal(stackItem)
    })
  }

  _getAnimatedComponent = (
    transitionOptions: ?Object = {}
  ): React$Element<*> => {
    const {
      clearListeners,
      currentModal,
      eventListeners,
      openModal,
      closeAllModals,
      closeModal,
      getParams,
      position,
      registerListener,
      stack,
      stackItem,
    } = this.props

    const Component = stackItem.component
    const addListener = (
      eventName: EventName,
      handler: () => void
    ): EventSubscription => registerListener(stackItem.hash, eventName, handler)
    const onAnimatedClose = () =>
      this._updateAnimatedValue(position - 1, closeModal)
    const removeAllListeners = () => clearListeners(stackItem.hash)

    return (
      <Animated.View style={{ ...transitionOptions }}>
        <Component
          modal={{
            addListener,
            currentModal,
            openModal,
            closeAllModals,
            closeModal: onAnimatedClose,
            getParams: fallback => getParams(stackItem.hash, fallback),
            removeAllListeners,
            ...(stackItem.params && { params: stackItem.params }),
          }}
        />
      </Animated.View>
    )
  }

  _getPosition = (stackItem: StackItemType): Object => {
    const { stack } = this.props
    const { position } = getStackItemOptions(stackItem, stack)

    switch (position) {
      case 'top':
        return { justifyContent: 'flex-start' }
      case 'bottom':
        return { justifyContent: 'flex-end' }
      default:
        return { justifyContent: 'center' }
    }
  }

  render() {
    const { position, stack, stackItem, zIndex } = this.props
    const { transitionOptions } = getStackItemOptions(stackItem, stack)

    return (
      <Animated.View
        style={[styles.container, { zIndex }, this._getPosition(stackItem)]}
      >
        {this._getAnimatedComponent(
          transitionOptions && transitionOptions(this.animatedValue)
        )}
      </Animated.View>
    )
  }
}

export default StackItem
