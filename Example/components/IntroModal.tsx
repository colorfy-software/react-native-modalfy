import {
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  Text,
  View,
  Platform,
} from 'react-native'
import {
  ModalEventCallback,
  ModalComponentProp,
  ModalEventListener,
} from 'react-native-modalfy'
import { useCallback, useEffect, useRef } from 'react'

import { ModalStackParamsList, ModalName } from '../App'

import ClassButton from './ClassButton'
import HooksButton from './HooksButton'
import openFromJS from './PlainJS'

const { width } = Dimensions.get('screen')

type Props = {
  modalName: ModalName
  title: string
  color: ModalStackParamsList[ModalName]['color']
}

const Card = ({ title, modalName: name, color }: Props) => {
  const onPress = () => openFromJS(name, color)
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <View style={[styles.cardIcon, { backgroundColor: color }]}>
          <Text style={{ color: 'white', fontSize: 54, fontWeight: 'bold' }}>
            {name.slice(-1)[0]}
          </Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold', width: '70%' }}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const IntroModal = ({
  modal: { addListener },
}: ModalComponentProp<ModalStackParamsList, void, 'IntroModal'>) => {
  const modalListener = useRef<ModalEventListener | undefined>()
  const animatedValue = useRef(new Animated.Value(0)).current

  const onModalAnimate: ModalEventCallback = useCallback(
    (value) => {
      if (value) animatedValue.setValue(value)
    },
    [animatedValue],
  )

  useEffect(() => {
    modalListener.current = addListener('onAnimate', onModalAnimate)

    return () => {
      modalListener.current?.remove()
    }

    // Should only be triggered on mount and unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const Header = () => (
    <Animated.View style={[styles.header, { opacity: animatedValue }]}>
      <View style={styles.handle} />
    </Animated.View>
  )

  return (
    <View style={styles.container}>
      <Header />
      <HooksButton
        modalName="ModalA"
        color="lightsalmon"
        title="Open from Hooks"
      />
      <ClassButton
        modalName="ModalB"
        color="deepskyblue"
        title="Open from Class"
      />
      <Card
        modalName="ModalC"
        color="deeppink"
        title="Open from plain JavaScript"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width,
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
    elevation: 5,
    shadowRadius: 18,
    borderRadius: 30,
    marginBottom: Platform.OS === 'ios' ? 25 : 0,
    width: width * 0.9,
    shadowOpacity: 0.16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    shadowColor: '#000000',
    backgroundColor: 'white',
    shadowOffset: { width: 0, height: 6 },
  },
  cardIcon: {
    width: width * 0.25,
    height: width * 0.25,
    marginRight: 30,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default IntroModal
