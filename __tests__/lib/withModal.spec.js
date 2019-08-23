import React from 'react'
import TestRenderer from 'react-test-renderer'
import { View } from 'react-native'

import ModalProvider from '../../lib/ModalProvider'
import createModalStack from '../../lib/createModalStack'
import withModal from '../../lib/withModal'

const objectify = obj => JSON.parse(JSON.stringify(obj))
const functionify = fn => fn => null

describe('🛒 withModal', () => {
  test('should provide the correct modal prop', () => {
    const stack = createModalStack({ Modal: View })
    const Comp = withModal(({ modal, setInput }) => {
      setInput(modal)
      return null
    })
    let input

    TestRenderer.create(
      <ModalProvider stack={stack}>
        <Comp setInput={context => (input = context)} />
      </ModalProvider>
    )

    const expected = {
      currentModal: null,
      openModal: functionify('openModal'),
      closeAllModals: functionify('closeAllModals'),
      closeModal: functionify('closeModal'),
      closeModals: functionify('closeModals'),
    }

    expect(objectify(input)).toMatchObject(objectify(expected))
  })
})
