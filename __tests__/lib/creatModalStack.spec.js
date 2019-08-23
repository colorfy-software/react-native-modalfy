import React from 'react'
import { Easing, View } from 'react-native'

import createModalStack from '../../lib/createModalStack'

const objectify = obj => JSON.parse(JSON.stringify(obj))

describe('✍️ createModalStack', () => {
  test('should throw error if no config passed', () => {
    expect(createModalStack).toThrow(
      'You need to provide a config to createModalStack()'
    )
  })

  test('should return valid modal stack if config is passed', () => {
    const config = { Modal: View }
    const stack = createModalStack(config)
    const expected = {
      names: ['Modal'],
      content: [{ index: 0, name: 'Modal', component: View, hash: '' }],
      defaultOptions: {
        animateInConfig: {
          duration: 450,
          easing: Easing.inOut(Easing.exp),
        },
        animateOutConfig: {
          duration: 450,
          easing: Easing.inOut(Easing.exp),
        },
        backButtonBehavior: 'pop',
        backdropOpacity: 0.6,
        position: 'center',
        shouldAnimateOut: true,
      },
      openedItems: new Set(),
      total: 1,
    }

    expect(objectify(stack)).toMatchObject(objectify(expected))
  })

  test('should return valid modal stack if config + defaultOptions are passed', () => {
    const config = { Modal: View }
    const defaultOptions = {
      animateOutConfig: {
        duration: 850,
        easing: Easing.ease(Easing.exp),
      },
      backButtonBehavior: 'clear',
      backdropOpacity: 0.9,
      position: 'bottom',
    }
    const stack = createModalStack(config, defaultOptions)
    const expected = {
      names: ['Modal'],
      content: [{ index: 0, name: 'Modal', component: View, hash: '' }],
      defaultOptions: {
        animateInConfig: {
          duration: 450,
          easing: Easing.inOut(Easing.exp),
        },
        animateOutConfig: {
          duration: 850,
          easing: Easing.ease(Easing.exp),
        },
        backButtonBehavior: 'clear',
        backdropOpacity: 0.9,
        position: 'bottom',
        shouldAnimateOut: true,
      },
      openedItems: new Set(),
      total: 1,
    }

    expect(objectify(stack)).toMatchObject(objectify(expected))
  })
})
