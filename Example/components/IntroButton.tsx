import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import { useModal } from 'react-native-modalfy'

import { ModalStackParamsList } from '../App'

const IntroButton = () => {
  const { openModal } = useModal<ModalStackParamsList>()
  const onPress = () => openModal('IntroModal')
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
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
