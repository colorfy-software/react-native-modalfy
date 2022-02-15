/* eslint-disable react-native/no-inline-styles */
import {
  TouchableOpacity,
  StyleSheet,
  // Easing,
  // Dimensions,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { ModalComponentProp, ModalComponentWithOptions } from 'react-native-modalfy'

import { ModalStackParamsList, ModalName } from '../App'

type ButtonProps = {
  letter: string
  onPress: Function
  backgroundColor: ModalStackParamsList[ModalName]['color'] | undefined
}

type ModalsColorType = {
  name: ModalName
  color: ModalStackParamsList[ModalName]['color']
}[]

type OtherModalsType = {
  modalName: ModalName
  color: ModalStackParamsList[ModalName]['color']
}[]

const HOOKS_MODALS_COLOR: ModalsColorType = [
  { name: 'ModalA', color: 'lightsalmon' },
  { name: 'ModalB', color: 'deepskyblue' },
  { name: 'ModalC', color: 'deeppink' },
]

const DemoModal: ModalComponentWithOptions<ModalComponentProp<ModalStackParamsList, void, ModalName>> = ({
  modal: { closeModal, closeModals, closeAllModals, getParam, openModal },
}) => {
  const [otherModals, setOtherModals] = useState<OtherModalsType>([])

  const { width } = useWindowDimensions()

  const origin = getParam('origin', 'Hooks')
  const color = getParam('color', 'darkgreen')
  const modalName = getParam('name')

  const Header = () => {
    const onPress = () => closeModal(undefined, () => console.log('✅  Closed latest opened modal'))

    return (
      <View style={styles.container}>
        <View style={[styles.headerTag, { backgroundColor: 'white' }]}>
          <Text style={[styles.headerTagText, { color }]}>{origin?.toLocaleUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={onPress} style={{ padding: 10 }}>
          <Text style={{ fontSize: 14 }}>❌</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const Footer = () => {
    const onCloseModals = () => closeModals(modalName, () => console.log(`✅  Closed ${modalName} modals`))
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={onCloseModals}>
          <Text style={{ fontWeight: '600' }}>🧹 all {modalName}s</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => closeAllModals(() => console.log('✅  Closed all modals'))}>
          <Text style={{ fontWeight: '600' }}>🧹 all modals</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const Button = ({ letter, onPress, backgroundColor }: ButtonProps) => {
    const onPressButton = () => onPress()
    return (
      <TouchableOpacity onPress={onPressButton} style={[styles.button, { backgroundColor }]}>
        <Text style={styles.buttonText}>{letter}</Text>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    setOtherModals(
      HOOKS_MODALS_COLOR.filter((entry) => entry.name !== modalName).reduce<OtherModalsType>(
        (output, item) => [...output, { modalName: item.name, color: item.color }],
        [],
      ),
    )
  }, [modalName])

  // Type checking at work 👇
  const onOpenSameModal = () =>
    openModal(modalName, { name: modalName, color, origin }, () => {
      console.log(`✅  Opened ${modalName}`)
    })

  const onPressLeftButton = () => {
    openModal(otherModals[0]?.modalName, {
      name: otherModals[0]?.modalName,
      color: otherModals[0]?.color,
      origin,
    })
  }

  const onPressRightButton = () => {
    openModal(otherModals[1]?.modalName, {
      name: otherModals[1]?.modalName,
      color: otherModals[1]?.color,
      origin,
    })
  }

  const size = Platform.OS === 'web' ? Math.max(width * 0.3, 320) : width * 0.85

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Header />
      <View style={styles.container}>
        <Button
          letter={otherModals[0]?.modalName.slice(-1)}
          backgroundColor={otherModals[0]?.color}
          onPress={onPressLeftButton}
        />
        <TouchableOpacity onPress={onOpenSameModal} style={{ justifyContent: 'center', alignItems: 'center' }}>
          <>
            <Text style={{ fontSize: 40, fontWeight: 'bold', color }}>{modalName}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600' }}>another one?</Text>
          </>
        </TouchableOpacity>
        <Button
          letter={otherModals[1]?.modalName.slice(-1)}
          backgroundColor={otherModals[1]?.color}
          onPress={onPressRightButton}
        />
      </View>
      <Footer />
    </View>
  )
}

DemoModal.modalOptions = {
  backdropOpacity: 0.4,
}

// 👆 Comment this one and uncomment that one 👇 to try a different stack animation
// const { width } = Dimensions.get('screen')
// DemoModal.modalOptions = {
//   backdropOpacity: 0.4,
//   animateInConfig: {
//     easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
//     duration: 450,
//   },
//   animateOutConfig: {
//     easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
//     duration: 450,
//   },
//   transitionOptions: (animatedValue) => ({
//     opacity: animatedValue.interpolate({
//       inputRange: [0, 1, 2, 3, 4],
//       outputRange: [0, 1, 0.9, 0.6, 0],
//     }),
//     transform: [
//       {
//         translateX: animatedValue.interpolate({
//           inputRange: [0, 1, 2],
//           outputRange: [-width / 2, 0, 25],
//         }),
//       },
//       {
//         rotate: animatedValue.interpolate({
//           inputRange: [0, 1, 2],
//           outputRange: ['-19deg', '0deg', '19deg'],
//         }),
//       },
//       {
//         scale: animatedValue.interpolate({
//           inputRange: [0, 1, 2],
//           outputRange: [0.8, 1, 0.8],
//         }),
//       },
//     ],
//   }),
// }

// 👆 Comment this one and uncomment that one 👇 to try a different stack animation
// const { width } = Dimensions.get('screen')
// DemoModal.modalOptions = {
//   animateInConfig: {
//     easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
//     duration: 450,
//   },
//   animateOutConfig: {
//     easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
//     duration: 450,
//   },
//   transitionOptions: (animatedValue) => ({
//     opacity: animatedValue.interpolate({
//       inputRange: [0, 1, 2, 3, 4],
//       outputRange: [0, 1, 0.9, 0.6, 0],
//     }),
//     transform: [
//       {
//         perspective: 2000,
//       },
//       {
//         translateX: animatedValue.interpolate({
//           inputRange: [0, 1, 2],
//           outputRange: [-width / 2, 0, 25],
//         }),
//       },
//       {
//         scale: animatedValue.interpolate({
//           inputRange: [-1, 0, 1, 2],
//           outputRange: [1.2, 1.2, 1, 0.9],
//         }),
//       },
//     ],
//   }),
// }

const styles = StyleSheet.create({
  wrapper: {
    padding: 25,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTag: {
    minWidth: 65,
    elevation: 5,
    minHeight: 25,
    shadowRadius: 4,
    borderRadius: 7,
    paddingVertical: 6,
    shadowOpacity: 0.16,
    alignItems: 'center',
    shadowColor: '#000000',
    paddingHorizontal: 12.5,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
  },
  headerTagText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
})

export default DemoModal
