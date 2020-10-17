import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

import { ModalfyParams, ModalProp } from '../types'

import ModalContext from './ModalContext'

import { invariant } from '../utils'

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
const withModal = <P extends ModalfyParams, Props extends object>(
  Component: React.ComponentClass<Props>,
) => {
  const displayName = Component.displayName || Component.name

  class WithModalComponent extends React.Component<
    Omit<Props, keyof ModalProp<P, {}>>
  > {
    static displayName = `withModal(${displayName})`
    static readonly WrappedComponent = Component

    render() {
      return (
        <ModalContext.Consumer>
          {(context) => {
            invariant(
              context,
              `You should not use ${displayName} outside a <ModalProvider>`,
            )
            return (
              <Component
                {...(this.props as Props)}
                modal={{
                  closeAllModals: context.closeAllModals,
                  currentModal: context.currentModal,
                  closeModals: context.closeModals,
                  closeModal: context.closeModal,
                  openModal: context.openModal,
                }}
              />
            )
          }}
        </ModalContext.Consumer>
      )
    }
  }

  return hoistStatics(WithModalComponent, Component)
}

export default withModal
