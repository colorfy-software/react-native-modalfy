import { modalfy } from 'react-native-modalfy'

import { ModalStackParamsList, ModalName } from '../App'

// You can use it without explicit type, if you added it to declaration file 👇
const { openModal } = modalfy()
// const { openModal } = modalfy<ModalStackParamsList>()

export default function <N extends ModalName>(name: N, color: ModalStackParamsList[N]['color']) {
  // Type checking at work 👇
  openModal(name, { name, color, origin: 'Plain JS' })
}
