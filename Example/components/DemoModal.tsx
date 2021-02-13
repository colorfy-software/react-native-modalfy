import React from 'react'
import {
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  // Easing,
  Text,
  View,
} from 'react-native'
import {
  ModalComponentWithOptions,
  ModalComponentProp,
} from 'react-native-modalfy'

import { ModalStackParamsList, ModalName } from 'App'

const { width } = Dimensions.get('screen')

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

const DemoModal: ModalComponentWithOptions<
  ModalComponentProp<ModalStackParamsList, void, ModalName>
> = ({
  modal: { closeModal, closeModals, closeAllModals, openModal, getParam },
}) => {
  const [otherModals, setOtherModals] = React.useState<OtherModalsType>([])

  const origin = getParam('origin', 'Hooks')
  const color = getParam('color', 'darkgreen')
  const modalName = getParam('name')

  const Header = () => {
    const onPress = () => closeModal()
    return (
      <View style={styles.container}>
        <View style={[styles.headerTag, { backgroundColor: 'white' }]}>
          <Text style={[styles.headerTagText, { color }]}>
            {origin?.toLocaleUpperCase()}
          </Text>
        </View>
        <TouchableOpacity onPress={onPress} style={{ padding: 10 }}>
          <Text style={{ fontSize: 14 }}>❌</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const Footer = () => {
    const onCloseModals = () => closeModals(modalName)
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={onCloseModals}>
          <Text style={{ fontWeight: '600' }}>Close all {modalName}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={closeAllModals}>
          <Text style={{ fontWeight: '600' }}>Close everything</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const Button = ({ letter, onPress, backgroundColor }: ButtonProps) => {
    const onPressButton = () => onPress()
    return (
      <TouchableOpacity
        onPress={onPressButton}
        style={[styles.button, { backgroundColor }]}
      >
        <Text style={styles.buttonText}>{letter}</Text>
      </TouchableOpacity>
    )
  }

  React.useEffect(() => {
    setOtherModals(
      HOOKS_MODALS_COLOR.filter(
        (entry) => entry.name !== modalName,
      ).reduce<OtherModalsType>(
        (output, item) => [
          ...output,
          { modalName: item.name, color: item.color },
        ],
        [],
      ),
    )
  }, [modalName])

  // Type checking at work 👇
  const onOpenSameModal = () =>
    openModal(modalName, { name: modalName, color, origin })

  const onPressLeftButton = React.useCallback(() => {
    openModal(otherModals[0]?.modalName, {
      name: otherModals[0]?.modalName,
      color: otherModals[0]?.color,
      origin,
    })
  }, [openModal, origin, otherModals])

  const onPressRightButton = React.useCallback(() => {
    openModal(otherModals[1]?.modalName, {
      name: otherModals[1]?.modalName,
      color: otherModals[1]?.color,
      origin,
    })
  }, [openModal, origin, otherModals])

  return (
    <View style={styles.wrapper}>
      <Header />
      <View style={styles.container}>
        <Button
          letter={otherModals[0]?.modalName.slice(-1)}
          backgroundColor={otherModals[0]?.color}
          onPress={onPressLeftButton}
        />
        <TouchableOpacity
          onPress={onOpenSameModal}
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <>
            <Text style={{ fontSize: 40, fontWeight: 'bold', color }}>
              {modalName}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600' }}>
              another one?
            </Text>
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
// DemoModal.modalOptions = {
// backdropOpacity: 0.4,
// animateInConfig: {
//   easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
//   duration: 450,
// },
// animateOutConfig: {
//   easing: Easing.bezier(0.42, -0.03, 0.27, 0.95),
//   duration: 450,
// },
// transitionOptions: (animatedValue) => ({
//   opacity: animatedValue.interpolate({
//     inputRange: [0, 1, 2, 3, 4],
//     outputRange: [0, 1, 0.9, 0.6, 0],
//   }),
//   transform: [
//     {
//       translateX: animatedValue.interpolate({
//         inputRange: [0, 1, 2],
//         outputRange: [-width / 2, 0, 25],
//       }),
//     },
//     {
//       rotate: animatedValue.interpolate({
//         inputRange: [0, 1, 2],
//         outputRange: ['-19deg', '0deg', '19deg'],
//       }),
//     },
//     {
//       scale: animatedValue.interpolate({
//         inputRange: [0, 1, 2],
//         outputRange: [0.8, 1, 0.8],
//       }),
//     },
//   ],
// }),
// }

// 👆 Comment this one and uncomment that one 👇 to try a different stack animation
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
    width: width * 0.85,
    height: width * 0.85,
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
    // color: 'white',
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
