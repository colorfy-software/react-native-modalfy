import React, { PureComponent } from 'react'
import {
  Easing,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ModalProvider, createModalStack } from 'react-native-modalfy'

import CardModal from './app/modals/CardModal'
import Button from './app/components/Button'

const { width } = Dimensions.get('screen')

const config = { CardModal }

const defaultOptions = {
  animateInConfig: {
    easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
    duration: 450,
  },
  animateOutConfig: {
    easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
    duration: 450,
  },
  transitionOptions: animatedValue => ({
    opacity: animatedValue.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 1, 0.9],
    }),
    transform: [
      { perspective: 2000 },
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [-width / 2, 0, width / 2],
        }),
      },
      {
        rotateY: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: ['90deg', '0deg', '-90deg'],
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [1.2, 1, 0.9],
        }),
      },
    ],
  }),
}

const stack = createModalStack(config, defaultOptions)

class App extends PureComponent {
  render() {
    return (
      <ModalProvider stack={stack}>
        <View style={styles.container}>
          <StatusBar animated hidden translucent />
          <Button label="Open modal" modalToOpen="CardModal" />
        </View>
      </ModalProvider>
    )
  }
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
