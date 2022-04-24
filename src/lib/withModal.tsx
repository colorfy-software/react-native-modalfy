import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

import type { ModalfyParams, ModalProp } from '../types'

import ModalContext from './ModalContext'

import { invariant } from '../utils'
import { modalfy } from './ModalState'

/**
 * HOC that provides the `modal` prop to a wrapped Class component.
 *
 * Note: Prefer `useModal()` Hook if you're using a Hook component.
 *
 * @param { React.ComponentClass<any> } Component - Component class.
 *
 * @returns Provided component class enhanced with the `modal` prop.
 *
 * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/withmodal
 */
const withModal = <P extends ModalfyParams, Props extends object>(Component: React.ComponentClass<Props>) => {
  const displayName = Component.displayName || Component.name
  const { closeModal, closeModals, closeAllModals } = modalfy<P>()

  const withModalComponent = class WithModalComponent extends React.Component<Omit<Props, keyof ModalProp<P, {}>>> {
    static readonly WrappedComponent = Component
    static displayName = `withModal(${displayName})`

    render() {
      return (
        <ModalContext.Consumer>
          {context => {
            invariant(context, `You should not use ${displayName} outside a <ModalProvider>`)
            return (
              <Component
                {...(this.props as Props)}
                modal={{
                  closeModal,
                  closeModals,
                  closeAllModals,
                  openModal: context.openModal,
                  currentModal: context.currentModal,
                }}
              />
            )
          }}
        </ModalContext.Consumer>
      )
    }
  }

  return hoistStatics(withModalComponent, Component)
}

export default withModal
