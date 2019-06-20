import React, { PureComponent } from 'react'
import { TouchableOpacity, StyleSheet, Text } from 'react-native'
import { withModal } from 'react-native-modalfy'

let REFERENCE_COUNTER = 0

class Button extends PureComponent {
  componentDidMount = () => {
    REFERENCE_COUNTER = REFERENCE_COUNTER + 1
  }

  openModal = () => {
    const { modalToOpen, modal } = this.props

    modal.openModal(modalToOpen, { counter: REFERENCE_COUNTER })
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
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
})
