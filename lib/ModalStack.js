/* @flow */

import React, { PureComponent } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  View,
} from 'react-native'

import type {
  EventName,
  EventSubscription,
  ModalEventListeners,
  ModalListener,
  ModalName,
  Stack,
  StackItem as StackItemType,
  TransitionOptions,
} from '../types'
import { vh, vw } from '../utils'

import StackItem from './StackItem'

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  backdrop: {
    width: vw(100),
    height: vh(100),
    backgroundColor: 'black',
  },
})

type Props = {
  clearListeners: (hash: string) => void,
  closeAllModals: (modal: ModalName) => void,
  closeModal: (stackItem: StackItemType) => void,
  currentModal: ?ModalName,
  eventListeners: ModalEventListeners,
  getParams: (hash: ?string, fallback?: any) => any,
  openModal: ModalName => void,
  registerListener: (
    hash: string,
    eventName: EventName,
    handler: () => void
  ) => EventSubscription,
  stack: Stack<Set<StackItemType>>,
}

type State = { openedItemsArray: Array<StackItemType> }

class ModalStack extends PureComponent<Props, State> {
  animatedValue = new Animated.Value(0)
  translateYValue = new Animated.Value(vh(100))
  state = { openedItemsArray: [...this.props.stack.openedItems] }

  static getDerivedStateFromProps = (props: Props, state: State): State => ({
    openedItemsArray: [...props.stack.openedItems],
  })

  componentDidUpdate(_: Props, prevState: State) {
    this._animateContent(prevState)
  }

  _animateContent = (prevState: State) => {
    const hasOpenedItemsNow = this.state.openedItemsArray.length
    const hadOpenedItems = prevState.openedItemsArray.length

    if (hasOpenedItemsNow) {
      this.translateYValue.setValue(0)
      Animated.timing(this.animatedValue, {
        toValue: 1,
        easing: Easing.in(Easing.ease),
        duration: 300,
        /**
         * It seems like when useNativeDriver is used with an interpolation,
         * upon opening a new activity (share sheet, alert, etc),
         * the backdropOpacity is set to 1. Until we find a fix/workaround
         * we're disabling native driver on Android only.
         */
        useNativeDriver: Platform.OS === 'ios',
      }).start()
    } else if (hadOpenedItems && !hasOpenedItemsNow) {
      Animated.timing(this.animatedValue, {
        toValue: 0,
        easing: Easing.inOut(Easing.ease),
        duration: 300,
        useNativeDriver: Platform.OS === 'ios',
      }).start()
      this.translateYValue.setValue(vh(100))
    }
  }

  renderStackItem = (
    stackItem: StackItemType,
    index: number
  ): React$Element<*> => (
    <StackItem
      {...this.props}
      // $FlowFixMe
      stackItem={stackItem}
      key={index}
      zIndex={index + 1}
      position={this.state.openedItemsArray.length - index}
    />
  )

  renderStack = (): ?Array<React$Element<*>> => {
    const { openedItemsArray } = this.state
    if (!openedItemsArray.length) return null
    return openedItemsArray.map(this.renderStackItem)
  }

  renderBackdrop = (): React$Element<*> => {
    const {
      stack: {
        defaultOptions: { backdropOpacity },
      },
    } = this.props
    return (
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: this.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, backdropOpacity],
            }),
          },
        ]}
      />
    )
  }

  render() {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: this.animatedValue,
            transform: [{ translateY: this.translateYValue }],
          },
        ]}
      >
        {this.renderStack()}
        {this.renderBackdrop()}
      </Animated.View>
    )
  }
}

export default ModalStack
