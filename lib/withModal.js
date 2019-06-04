import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

import ModalContext from './ModalContext'
import { invariant } from '../utils'

// TODO: add `onRef` support for wrapped component
export default function(Component) {
  const displayName = `withModal(${Component.displayName || Component.name})`
  const C = props => {
    return (
      <ModalContext.Consumer>
        {context => {
          invariant(
            context,
            `You should not use ${displayName} outside a <ModalProvider>`
          )
          return (
            <Component
              {...props}
              modal={{
                currentModal: context.currentModal,
                openModal: context.openModal,
                closeModal: context.closeModal,
              }}
            />
          )
        }}
      </ModalContext.Consumer>
    )
  }

  C.displayName = displayName

  return hoistStatics(C, Component)
}
