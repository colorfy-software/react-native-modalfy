import {
  ModalProps,
  ModalEventListener,
  ModalOnCloseEventCallback,
  ModalOnAnimateEventCallback,
} from 'react-native-modalfy'
import React, { memo, useCallback, useEffect, useRef } from 'react'
import { TouchableOpacity, StyleSheet, Animated, Text, View, Platform, useWindowDimensions } from 'react-native'

import { ModalStackParamsList, ModalName } from '../App'

import ClassButton from './ClassButton'
import HooksButton from './HooksButton'
import openFromJS from './PlainJS'

type Props = {
  title: string
  modalName: ModalName
  color: ModalStackParamsList[ModalName]['color']
}

const Card = ({ title, modalName: name, color }: Props) => {
  const { width } = useWindowDimensions()
  const onPress = () => openFromJS(name, color)
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View
        style={[
          styles.cardIcon,
          { width: Math.min(width * 0.25, 100), height: Math.min(width * 0.25, 100), backgroundColor: color },
        ]}>
        <Text style={styles.cardInitial}>{name.slice(-1)[0]}</Text>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  )
}

const IntroModal = ({ modal: { addListener } }: ModalProps<'IntroModal'>) => {
  const onAnimateListener = useRef<ModalEventListener | undefined>()
  const onCloseListener = useRef<ModalEventListener | undefined>()
  const animatedValue = useRef(new Animated.Value(0)).current
  const { width } = useWindowDimensions()

  const handleAnimation: ModalOnAnimateEventCallback = useCallback(
    value => {
      if (value) animatedValue.setValue(value)
    },
    [animatedValue],
  )

  const handleClose: ModalOnCloseEventCallback = useCallback(closingAction => {
    console.log(`👋 IntroModal closed by: ${closingAction.type} • ${closingAction.origin}`)
  }, [])

  useEffect(() => {
    onAnimateListener.current = addListener('onAnimate', handleAnimation)
    onCloseListener.current = addListener('onClose', handleClose)

    return () => {
      onAnimateListener.current?.remove()
    }
  }, [addListener, handleAnimation, handleClose])

  const Header = memo(() => (
    <Animated.View style={[styles.header, { opacity: animatedValue }]}>
      <View style={styles.handle} />
    </Animated.View>
  ))

  return (
    <View style={[styles.container, { width: Platform.OS === 'web' ? Math.min(width * 0.85, 900) : width }]}>
      <Header />
      <HooksButton modalName="ModalA" color="lightsalmon" title="Open from Hooks" />
      <ClassButton modalName="ModalB" color="deepskyblue" title="Open from Class" width={width} />
      <Card modalName="ModalC" color="deeppink" title="Open from VanillaJS" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
    borderTopLeftRadius: 40,
    backgroundColor: 'white',
    borderTopRightRadius: 40,
  },
  header: {
    marginVertical: 20,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: 4,
    marginBottom: 10,
    backgroundColor: '#C4D6DC',
  },
  card: {
    height: 150,
    width: '90%',
    elevation: 5,
    shadowRadius: 18,
    borderRadius: 30,
    marginBottom: Platform.OS === 'ios' ? 25 : 0,
    shadowOpacity: 0.16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 35,
    shadowColor: '#000000',
    backgroundColor: 'white',
    shadowOffset: { width: 0, height: 6 },
  },
  cardIcon: {
    marginRight: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    width: '70%',
  },
  cardInitial: {
    color: 'white',
    fontSize: 54,
    fontWeight: 'bold',
  },
})

export default IntroModal
