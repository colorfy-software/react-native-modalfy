/* @flow */

import React, { Component } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'

import type {
  ModalName,
  Stack,
  StackItem as StackItemType,
  TransitionOptions,
} from '../types'

import { getStackItemOptions } from '../utils'

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

class StackItem extends Component<Props> {
  animatedValue = new Animated.Value(-1)

  componentDidMount() {
    const { stack, stackItem } = this.props
    const { transitionOptions } = getStackItemOptions(stackItem, stack)

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

  shouldComponentUpdate(nextProps: Props) {
    if (this.props.position !== nextProps.position) return true
    return false
  }

  componentDidUpdate() {
    this._updateAnimatedValue(this.props.position)
  }

  _updateAnimatedValue = (toValue: number, closeModal?: Function) => {
    const { stack, stackItem } = this.props
    const {
      animateInConfig,
      animateOutConfig,
      shouldAnimateOut,
    } = getStackItemOptions(stackItem, stack)

    if (!shouldAnimateOut) closeModal?.()

    Animated.timing(this.animatedValue, {
      toValue,
      useNativeDriver: true,
      ...(closeModal ? animateOutConfig : animateInConfig),
    }).start(({ finished }) => {
      if (finished && closeModal && shouldAnimateOut) closeModal()
    })
  }

  _getAnimatedComponent = (
    transitionOptions: ?Object = {}
  ): React$Element<*> => {
    const {
      currentModal,
      openModal,
      closeModal,
      getParams,
      position,
      stack,
      stackItem,
    } = this.props

    const Component = stackItem.component
    const onAnimatedClose = () =>
      this._updateAnimatedValue(position - 1, closeModal)

    return (
      <Animated.View style={{ ...transitionOptions }}>
        <Component
          modal={{
            currentModal,
            openModal,
            closeModal: onAnimatedClose,
            getParams,
            // $FlowFixMe
            ...(stack.params?.[currentModal] && {
              // $FlowFixMe
              params: stack.params[currentModal],
            }),
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
        style={[styles.container(zIndex), this._getPosition(stackItem)]}
      >
        {this._getAnimatedComponent(
          transitionOptions && transitionOptions(this.animatedValue)
        )}
      </Animated.View>
    )
  }
}

export default StackItem
