import React from 'react'
import { Animated } from 'react-native'
import TestRenderer, { act } from 'react-test-renderer'

import { createModalStack } from '../index'
import ModalStack from '../lib/ModalStack'

const FirstModal = () => null
const SecondModal = () => null

const stack = createModalStack({
  FirstModal: {
    modal: FirstModal,
    backdropColor: 'orange',
    backdropOpacity: 0,
    containerStyle: { backgroundColor: 'red' },
  },
  SecondModal: {
    modal: SecondModal,
    backdropColor: 'purple',
    backdropOpacity: 0.4,
    containerStyle: { backgroundColor: 'blue' },
  },
})

const firstStackItem = { ...stack.content[0], hash: 'first-modal-instance' }
const secondStackItem = { ...stack.content[1], hash: 'second-modal-instance' }

const sharedProps = {
  clearListeners: jest.fn(),
  closeAllModals: jest.fn(),
  closeModal: jest.fn(),
  closeModals: jest.fn(),
  eventListeners: new Set(),
  getParam: jest.fn(),
  openModal: jest.fn(),
  registerListener: jest.fn(() => ({ remove: jest.fn() })),
  removeClosingAction: jest.fn(),
}

afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
})

const stackWith = (item: typeof firstStackItem | typeof secondStackItem) => ({
  ...stack,
  openedItems: new Set([item]),
})

const hasContainerColor = (renderer: TestRenderer.ReactTestRenderer, color: string) =>
  renderer.root.findAll(
    node =>
      Array.isArray(node.props.style) &&
      node.props.style.some((style: { backgroundColor?: string } | null) => style?.backgroundColor === color),
  ).length > 0

it('keeps modal settings isolated when replacing an item at the same stack position', () => {
  jest.useFakeTimers()
  jest.spyOn(Animated, 'timing').mockImplementation(() => {
    const animation: Animated.CompositeAnimation = {
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    }
    return animation
  })

  let renderer!: TestRenderer.ReactTestRenderer

  act(() => {
    renderer = TestRenderer.create(
      <ModalStack {...(sharedProps as any)} currentModal="FirstModal" stack={stackWith(firstStackItem)} />,
    )
    jest.runOnlyPendingTimers()
  })

  expect(hasContainerColor(renderer, 'red')).toBe(true)
  expect(hasContainerColor(renderer, 'orange')).toBe(true)

  act(() => {
    renderer.update(
      <ModalStack {...(sharedProps as any)} currentModal="SecondModal" stack={stackWith(secondStackItem)} />,
    )
    jest.runOnlyPendingTimers()
  })

  expect(hasContainerColor(renderer, 'blue')).toBe(true)
  expect(hasContainerColor(renderer, 'red')).toBe(false)
  expect(hasContainerColor(renderer, 'purple')).toBe(true)
  expect(hasContainerColor(renderer, 'orange')).toBe(false)
})
