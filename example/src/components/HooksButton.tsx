import React from 'react'
import { useModal } from 'react-native-modalfy'
import { TouchableOpacity, StyleSheet, Text, View, useWindowDimensions } from 'react-native'

import { ModalStackParamsList, ModalName } from '../App'

interface Props {
  color: ModalStackParamsList[ModalName]['color']
  modalName: ModalName
  title: string
}

const HooksButton = ({ color, title, modalName: name }: Props) => {
  const { width } = useWindowDimensions()
  const { openModal } = useModal<ModalStackParamsList>()
  const onPress = () => {
    // Type checking at work 👇
    openModal(name, { name, color, origin: 'Hooks' })
  }

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

export default HooksButton
