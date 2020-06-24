import React from 'react'
import {
  ImageBackground,
  Dimensions,
  StyleSheet,
  StatusBar,
  Easing,
  Text,
} from 'react-native'
import {
  ModalStackOptions,
  ModalStackConfig,
  createModalStack,
  ModalProvider,
} from 'react-native-modalfy'

import DemoModal from './components/DemoModal'
import IntroModal from './components/IntroModal'
import IntroButton from './components/IntroButton'

interface Modal<N, C> {
  origin: 'Hooks' | 'Class' | 'Plain JS'
  color: C | 'darkgreen'
  // 👆 Comment this one and uncomment that one 👇 to remove all the TypeScript errors
  // color: 'lightsalmon' | 'deepskyblue' | 'deeppink' | 'darkgreen'
  // Note: the TS errors were left voluntarily to showcase the type inference & autocomplete possibilities
  name: N
}

export interface ModalStackParamsList {
  ModalA: Modal<'ModalA', 'lightsalmon'>
  ModalB: Modal<'ModalB', 'deepskyblue'>
  ModalC: Modal<'ModalC', 'deeppink'>
  IntroModal: undefined
}

export type ModalName = Exclude<keyof ModalStackParamsList, 'IntroModal'>

const { width } = Dimensions.get('screen')

const config: ModalStackConfig = {
  IntroModal: {
    modal: IntroModal,
    position: 'bottom',
    backdropOpacity: 0.5,
    animateOutConfig: {
      easing: Easing.inOut(Easing.exp),
      duration: 500,
    },
    transitionOptions: (animatedValue) => ({
      transform: [
        {
          translateY: animatedValue.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [width * 3, 0, width * 3],
          }),
        },
      ],
    }),
  },
  ModalA: DemoModal,
  ModalB: DemoModal,
  ModalC: DemoModal,
}

const defaultOptions: ModalStackOptions = {
  backdropOpacity: 0.4,
  animateInConfig: {
    easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
    duration: 300,
  },
  animateOutConfig: {
    easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
    duration: 300,
  },
  transitionOptions: (animatedValue) => ({
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

const stack = createModalStack<ModalStackParamsList>(config, defaultOptions)

const App = () => (
  <ModalProvider stack={stack}>
    <ImageBackground
      style={styles.container}
      source={require('./assets/background.jpg')}
    >
      <StatusBar
        translucent
        barStyle="light-content"
        backgroundColor="transparent"
      />
      <Text style={styles.title}>🥞 Modalfy</Text>
      <IntroButton />
    </ImageBackground>
  </ModalProvider>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 54,
    color: 'white',
    marginBottom: 50,
    fontWeight: 'bold',
  },
})

export default App
