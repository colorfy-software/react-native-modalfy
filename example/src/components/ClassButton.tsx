import React, { Component } from 'react'
import { ModalProp, withModal } from 'react-native-modalfy'
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native'

import { ModalStackParamsList, ModalName } from '../App'

interface OwnProps {
  title: string
  width: number
  modalName: ModalName
  color: ModalStackParamsList[ModalName]['color']
}

type Props = ModalProp<ModalStackParamsList, OwnProps>

class ClassButton extends Component<Props> {
  onPress = () => {
    const {
      color,
      modalName: name,
      modal: { openModal },
    } = this.props

    // Type checking at work 👇
    openModal(name, { name, color, origin: 'Class' })
  }

  render() {
    const { color: backgroundColor, modalName: name, title, width } = this.props
    return (
      <TouchableOpacity style={styles.card} onPress={this.onPress}>
        <View
          style={[
            styles.cardIcon,
            { width: Math.min(width * 0.25, 100), height: Math.min(width * 0.25, 100), backgroundColor },
          ]}>
          <Text style={styles.cardInitial}>{name.slice(-1)[0]}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    height: 150,
    width: '90%',
    elevation: 5,
    shadowRadius: 18,
    borderRadius: 30,
    marginBottom: 25,
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

export default withModal(ClassButton)
