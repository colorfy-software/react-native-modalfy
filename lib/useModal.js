import { useContext } from 'react'

import ModalContext from './ModalContext'

export default function() {
  const context = useContext(ModalContext)
  return {
    currentModal: context.currentModal,
    openModal: context.openModal,
    closeAllModals: context.closeAllModals,
    closeModal: context.closeModal,
    closeModals: context.closeModals,
  }
}
