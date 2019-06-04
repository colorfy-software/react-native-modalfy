import React, { PureComponent } from 'react'
import { View, Dimensions, Text, StyleSheet } from 'react-native'

import Button from '../components/Button'

const { width: ww, height: wh } = Dimensions.get('screen')

class CardModal extends PureComponent {
  render() {
    const { counter } = this.props.modal.params
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{counter}</Text>
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
