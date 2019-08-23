import React, { Fragment } from 'react'
import TestRenderer from 'react-test-renderer'
import { View } from 'react-native'
import { shallow } from 'enzyme'

import ModalProvider from '../../lib/ModalProvider'
import createModalStack from '../../lib/createModalStack'

describe('💧 ModalProvider', () => {
  beforeAll(() => {
    stack = createModalStack({ Modal: View })
  })

  test('should throw when no stack was passed', () => {
    expect(() => shallow(<ModalProvider />)).toThrow(
      'You need to provide a stack prop to <ModalProvider>'
    )
  })

  test('should render children correctly', () => {
    const component = TestRenderer.create(
      <ModalProvider stack={stack}>
        <View />
      </ModalProvider>
    )
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
