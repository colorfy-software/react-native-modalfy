import { useContext } from 'react'

import type { ModalfyParams, UsableModalProp } from '../types'

import ModalContext from './ModalContext'
import { modalfy } from './ModalState'

const { closeModal, closeModals, closeAllModals } = modalfy()

/**
 * Hook that exposes Modalfy's API.
 *
 * @returns Object containing all the functions and variables of the usual `modal` prop.
 *
 * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/usemodal
 */
export default function <P extends ModalfyParams>(): UsableModalProp<P> {
  const context = useContext(ModalContext) as UsableModalProp<P>
  return {
    /**
     * This function closes every open modal.
     *
     * @example modal.closeAllModals(() => console.log('All modals closed'))
     *
     * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#closeallmodals
     *
     * @note We're using modalfy.closeAllModals instead of ModalState.closeAllModals so that the animations
     * can be triggered appropriately from the synced custom internal state.
     */
    closeAllModals: closeAllModals as UsableModalProp<P>['closeAllModals'],
    /**
     * This function closes the currently displayed modal by default.
     *
     * You can also provide a `modalName` if you want to close a different modal
     * than the latest opened. This will only close the latest instance of that modal,
     * see `closeModals()` if you want to close all instances.
     *
     * @example modal.closeModal('Example', () => console.log('Current modal closed'))
     *
     * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#closemodal
     *
     * @note We're using modalfy.closeModal instead of ModalState.closeModal so that the animations
     * can be triggered appropriately from the synced custom internal state.
     */
    closeModal: closeModal as UsableModalProp<P>['closeModal'],
    /**
     * This function closes all the instances of a given modal.
     *
     * You can use it whenever you have the same modal opened
     * several times, to close all of them at once.
     *
     * @example modal.closeModals('ExampleModal', () => console.log('All ExampleModal modals closed'))
     *
     * @returns { boolean } Whether or not Modalfy found any open modal
     * corresponding to `modalName` (and then closed them).
     *
     * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#closemodals
     *
     * @note We're using modalfy.closeModals instead of ModalState.closeModals so that the animations
     * can be triggered appropriately from the synced custom internal state.

     */
    closeModals: closeModals as unknown as UsableModalProp<P>['closeModals'],
    /**
     * This value returns the current open modal (`null` if none).
     *
     * @example modal.currentModal
     *
     * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#currentmodal
     */
    currentModal: context.currentModal,
    /**
     * This function opens a modal based on the provided `modalName`.
     *
     * It will look at the stack passed to `<ModalProvider>` and add
     * the corresponding component to the current stack of open modals.
     * Alternatively, you can also provide some `params` that will be
     * accessible to that component.
     *
     * @example openModal('PokedexEntryModal', { id: 619, name: 'Lin-Fu' }, () => console.log('PokedexEntryModal modal opened'))
     *
     * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#openmodal
     */
    openModal: context.openModal,
  }
}
