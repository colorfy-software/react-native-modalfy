import React, { PureComponent } from 'react'
import {
  Button as ButtonModule,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import Button from '../components/Button'

const { width: ww, height: wh } = Dimensions.get('screen')

class CardModal extends PureComponent {
  componentDidMount() {
    const { modal } = this.props
    this.modalListenerID = modal.addListener('onAnimate', this._handleAnimation)
  }

  componentWillUnmount() {
    this.modalListenerID?.remove()
  }

  _handleAnimation = animatedValue => {
    const { counter } = this.props.modal.params
    console.log(`✨ Card ${counter}:`, animatedValue)
  }

  render() {
    const {
      closeAllModals,
      closeModal,
      params: { counter },
    } = this.props.modal
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{counter}</Text>
        <Button label="Open Modal" modalToOpen="CardModal" />
        <ButtonModule title="Close" onPress={closeModal} color="#333ddd" />
        <ButtonModule
          title="Close all"
          onPress={() => closeAllModals('CardModal')}
          color="#ff3300"
        />
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
