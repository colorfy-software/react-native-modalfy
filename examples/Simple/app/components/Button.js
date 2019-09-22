import React, { PureComponent } from 'react'
import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import { withModal } from 'react-native-modalfy'

class Button extends PureComponent {
  openModal = () => {
    const { color, modalToOpen, modal } = this.props

    modal.openModal(modalToOpen, { color })
  }

  render() {
    const { color, label } = this.props

    return (
      <TouchableOpacity onPress={this.openModal} style={styles.button(color)}>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: backgroundColor => ({
    backgroundColor,
    paddingHorizontal: 60,
    paddingVertical: 21,
    borderRadius: 21,
    marginBottom: 30,
  }),
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
})

export default withModal(Button)
