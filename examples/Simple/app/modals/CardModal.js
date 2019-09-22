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
    const { currentModal } = this.props.modal
    console.info(`✨ ${currentModal}:`, animatedValue)
  }

  render() {
    const {
      currentModal,
      closeModal,
      closeModals,
      closeAllModals,
      params: { color },
    } = this.props.modal

    return (
      <View style={styles.card}>
        <Text style={styles.title(color)}>{currentModal}</Text>
        <Button label="Open ModalA" modalToOpen="ModalA" color="tomato" />
        <Button label="Open ModalB" modalToOpen="ModalB" color="darkcyan" />
        <Button label="Open ModalC" modalToOpen="ModalC" color="deeppink" />
        
        <ButtonModule title="Close" onPress={closeModal} color="dodgerblue" />
        <ButtonModule title={`Close all ${currentModal}`} onPress={() => closeModals(currentModal)} color="dodgerblue" />
        <ButtonModule title="Close all modals" onPress={closeAllModals} color="red" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  title: color => ({
    color,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 50,
  }),
  card: {
    width: ww * 0.85,
    height: wh * 0.7,
    backgroundColor: 'white',
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
})

export default CardModal
