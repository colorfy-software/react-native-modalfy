import { Component } from 'react'
import {
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { ModalProp, withModal } from 'react-native-modalfy'

import { ModalStackParamsList, ModalName } from '../App'

interface OwnProps {
  color: ModalStackParamsList[ModalName]['color']
  modalName: ModalName
  title: string
}

type Props = ModalProp<ModalStackParamsList, OwnProps>

const { width } = Dimensions.get('screen')

class ClassButton extends Component<Props> {
  onPress = () => {
    const {
      modal: { openModal },
      color,
      modalName: name,
    } = this.props

    // Type checking at work 👇
    openModal(name, { name, color, origin: 'Class' })
  }

  render() {
    const { color: backgroundColor, modalName: name, title } = this.props
    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={styles.card}>
          <View style={[styles.cardIcon, { backgroundColor }]}>
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

export default withModal(ClassButton)
