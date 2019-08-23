import React from 'react'
import TestRenderer from 'react-test-renderer'
import { View } from 'react-native'

import ModalProvider from '../../lib/ModalProvider'
import createModalStack from '../../lib/createModalStack'
import useModal from '../../lib/useModal'

const objectify = obj => JSON.parse(JSON.stringify(obj))
const functionify = fn => fn => null

describe('🔮 useModal', () => {
  test('should provide the correct modal prop', () => {
    const stack = createModalStack({ Modal: View })
    const Comp = ({ setInput }) => {
      setInput(useModal())
      return null
    }
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
