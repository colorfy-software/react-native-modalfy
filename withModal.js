import React, { memo } from 'react'
import hoistStatics from 'hoist-non-react-statics'

import ModalContext from './modules/ModalContext'
import { invariant } from './utils'

function withModal(Component) {
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

export default memo(withModal)
