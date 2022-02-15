import { modalfy } from 'react-native-modalfy'

import { ModalStackParamsList, ModalName } from '../App'

const { openModal } = modalfy<ModalStackParamsList>()

export default function (name: ModalName, color: ModalStackParamsList[ModalName]['color']) {
  // Type checking at work 👇
  openModal(name, { name, color, origin: 'Plain JS' })
}
