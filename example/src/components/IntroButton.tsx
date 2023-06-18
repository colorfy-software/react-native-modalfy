import React from 'react'
import { useModal } from 'react-native-modalfy'
import { TouchableOpacity, StyleSheet, Text } from 'react-native'

import { ModalStackParamsList } from '../App'

const IntroButton = () => {
  // You can use it without explicit type, if you added it to declaration file 👇
  // const { openModal } = useModal()
  const { openModal } = useModal<ModalStackParamsList>()

  const onPress = () => openModal('IntroModal')
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Show me!</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 150,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 60,
    backgroundColor: 'white',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#064635',
  },
})

export default IntroButton
