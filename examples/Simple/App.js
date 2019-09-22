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

const config = { ModalA: CardModal, ModalB: CardModal, ModalC: CardModal }

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
          outputRange: [-width / 1.5, 0, width / 1.5],
          extrapolate: 'clamp',
        }),
      },
      {
        rotateY: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: ['90deg', '0deg', '-90deg'],
          extrapolate: 'clamp',
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [1.2, 1, 0.9],
          extrapolate: 'clamp',
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
          <Text style={styles.title}>RNM</Text>
          <Button label="Open ModalA" modalToOpen="ModalA" color="tomato" />
          <Button label="Open ModalB" modalToOpen="ModalB" color="darkcyan" />
          <Button label="Open ModalC" modalToOpen="ModalC" color="deeppink" />
        </View>
      </ModalProvider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'indigo',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: 'white',
    fontSize: 54,
    fontWeight: 'bold',
    marginBottom: 50,
  },
})

export default App

