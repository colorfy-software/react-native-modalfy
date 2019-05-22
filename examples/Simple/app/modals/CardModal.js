import React, { PureComponent } from 'react'
import { View, Dimensions, Text, StyleSheet } from 'react-native'

import Button from '../components/Button/Button'

const { width: ww, height: wh } = Dimensions.get('screen')

let REFERENCE_COUNTER = 1

class CardModal extends PureComponent {
  componentDidMount = () => {
    REFERENCE_COUNTER = REFERENCE_COUNTER + 1
  }

  render() {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{REFERENCE_COUNTER}</Text>
        <Button label="Open Modal" modalToOpen="CardModal" />
      </View>
    )
  }
}

export default CardModal

const styles = StyleSheet.create({
  title: {
    fontSize: 72,
    color: '#333ddd',
    marginBottom: 30,
  },
  card: {
    width: ww * 0.75,
    height: wh * 0.6,
    backgroundColor: 'white',
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
})
