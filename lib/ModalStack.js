/* @flow */

import React, { Component } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import type { SharedProps, StackItem as StackItemType } from '../types'
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

type Props = SharedProps

type State = {
  backdropClosedItems: Array<string>,
  openedItemsArray: Array<StackItemType>,
}

class ModalStack extends Component<Props, State> {
  state = {
    backdropClosedItems: [],
    openedItemsArray: [...this.props.stack.openedItems],
  }

  animatedValue = new Animated.Value(0)

  translateYValue = new Animated.Value(vh(100))

  static getDerivedStateFromProps = (props: Props, state: State): State => ({
    ...state,
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

  _onBackdropPress = (hash: string) => {
    this.setState(state => ({
      backdropClosedItems: [...state.backdropClosedItems, hash],
    }))
  }

  renderStackItem = (
    stackItem: StackItemType,
    index: number
  ): React$Element<*> => (
    <StackItem
      {...this.props}
      stackItem={stackItem}
      key={index}
      zIndex={index + 1}
      position={this.state.openedItemsArray.length - index}
      wasClosedByBackdropPress={this.state.backdropClosedItems.includes(
        stackItem.hash
      )}
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
    const currentItem = this.state.openedItemsArray.slice(-1)[0]
    const onPress = () => this._onBackdropPress(currentItem.hash)

    return (
      <TouchableWithoutFeedback onPress={onPress}>
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
      </TouchableWithoutFeedback>
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
