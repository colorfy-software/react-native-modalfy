import React, { PureComponent } from 'react'
import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import { withModal } from 'react-native-modalfy'

class Button extends PureComponent {
  openModal = () => {
    const { modalToOpen, modal } = this.props

    modal.openModal(modalToOpen)
  }

  render() {
    const { label } = this.props

    return (
      <TouchableOpacity onPress={this.openModal} style={styles.button}>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    )
  }
}

export default withModal(Button)

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 60,
    paddingVertical: 21,
    backgroundColor: '#333ddd',
    borderRadius: 21,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
})
