import React, { PureComponent } from 'react'
import { View, Text, StatusBar, StyleSheet, Easing, Dimensions } from 'react-native'
import { ModalProvider, createModalStack } from 'react-native-modalfy'

import CardModal from './app/modals/CardModal'
import Button from './app/components/Button/Button'

const { width } = Dimensions.get('screen')

const config = { CardModal }
const defaultOptions = {
  transitionOptions: animatedValue => ({
    opacity: animatedValue.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 1, .9],
    }),
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [-width / 2, 0, 25],
        }),
      },
      {
        rotate: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: ['-19deg', '0deg', '19deg'],
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1, 2],
          outputRange: [.8, 1, .8],
        }),
      },
    ],
  }),
  animateInConfig: {
    easing: Easing.bezier(.42,-0.03,.27,.95),
    duration: 450,
  },
  animateOutConfig: {
    easing: Easing.bezier(.42,-0.03,.27,.95),
    duration: 450,
  },
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
