/* @flow */

import React, { PureComponent } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'

import type {
  ModalName,
  Stack,
  StackItem as StackItemType,
  TransitionOptions,
} from '../types'

type Props = {
  getParams: (modalName: ModalName, fallback?: any) => any,
  closeModal: (modal?: ModalName) => void,
  currentModal: ?ModalName,
  openModal: ModalName => void,
  position: number,
  stack: Stack,
  stackItem: StackItemType,
  zIndex: number,
}

const styles = StyleSheet.create({
  container: zIndex => ({
    ...StyleSheet.absoluteFill,
    zIndex,
    alignItems: 'center',
    backgroundColor: 'transparent',
  }),
})

class StackItem extends PureComponent<Props> {
  animatedValue = new Animated.Value(-1)

  componentDidMount() {
    const { stack, stackItem } = this.props
    const transitionOptions =
      stackItem?.options?.transitionOptions ||
      stack.defaultOptions.transitionOptions

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

    this._updateAnimatedValue(1)
  }

  componentDidUpdate() {
    this._updateAnimatedValue(this.props.position)
  }

  _updateAnimatedValue = (toValue: number, closeModal?: Function) => {
    const { stack, stackItem } = this.props
    const animateInConfig =
      stackItem?.options?.animateInConfig ||
      stack.defaultOptions.animateInConfig
    const animateOutConfig =
      stackItem?.options?.animateOutConfig ||
      stack.defaultOptions.animateOutConfig
    const shouldAnimateOut =
      stackItem?.options?.shouldAnimateOut ??
      stack.defaultOptions.shouldAnimateOut

    if (!shouldAnimateOut) closeModal?.()

    Animated.timing(this.animatedValue, {
      toValue,
      useNativeDriver: true,
      ...(closeModal ? animateOutConfig : animateInConfig),
    }).start(({ finished }) => {
      if (finished && closeModal && shouldAnimateOut) closeModal()
    })
  }

  _getAnimatedComponent = transitionOptions => {
    const {
      currentModal,
      openModal,
      closeModal,
      getParams,
      position,
      stack,
      stackItem,
    } = this.props

    const onAnimatedClose = () =>
      this._updateAnimatedValue(position - 1, closeModal)

    const Component = React.memo(() =>
      // $FlowFixMe
      React.createElement(stackItem.component, {
        modal: {
          currentModal,
          openModal,
          closeModal: onAnimatedClose,
          getParams,
          // $FlowFixMe
          ...(stack.params?.[currentModal] && {
            // $FlowFixMe
            params: stack.params[currentModal],
          }),
        },
      }))

    return React.memo(() => (
      <Animated.View style={{ ...transitionOptions }}>
        <Component />
      </Animated.View>
    ))
  }

  _getPosition = (stackItem: StackItemType): Object => {
    const { stack } = this.props
    const position =
      stackItem.options?.position || stack.defaultOptions.position
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
    const transitionOptions =
      stackItem?.options?.transitionOptions ||
      stack.defaultOptions.transitionOptions

    const AnimatedComponent = this._getAnimatedComponent(
      transitionOptions && transitionOptions(this.animatedValue)
    )

    return (
      <Animated.View
        style={[styles.container(zIndex), this._getPosition(stackItem)]}
      >
        <AnimatedComponent />
      </Animated.View>
    )
  }
}

export default StackItem
