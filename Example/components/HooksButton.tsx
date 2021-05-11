import {
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useModal } from 'react-native-modalfy'

const { width } = Dimensions.get('screen')

import { ModalStackParamsList, ModalName } from '../App'

interface Props {
  color: ModalStackParamsList[ModalName]['color']
  modalName: ModalName
  title: string
}

const HooksButton = ({ color, title, modalName: name }: Props) => {
  const { openModal } = useModal<ModalStackParamsList>()
  const onPress = () => {
    // Type checking at work 👇
    openModal(name, { name, color, origin: 'Hooks' })
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <View style={[styles.cardIcon, { backgroundColor: color }]}>
          <Text style={{ color: 'white', fontSize: 54, fontWeight: 'bold' }}>
            {name.slice(-1)[0]}
          </Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold', width: '60%' }}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    height: 150,
    elevation: 5,
    shadowRadius: 18,
    borderRadius: 30,
    marginBottom: 25,
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

export default HooksButton
