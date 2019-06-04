/* @flow */

import React, { Fragment, Component } from 'react'
import { BackHandler, View } from 'react-native'

import type { ModalName, Stack } from '../types'
import { invariant } from '../utils'
import ModalContext from './ModalContext'
import ModalStack from './ModalStack'

type Props = {
  children: React$Element<*>,
  stack: Stack,
}

type State = {
  currentModal: ?ModalName,
  getParams: (hash: string, fallback?: any) => any,
  closeModal: (modal?: ModalName) => void,
  openModal: (modalName: ModalName, params?: Object) => void,
  stack: Stack,
}

class ModalProvider extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      currentModal: null,
      stack: props.stack,
      openModal: this._openModal,
      closeModal: this._closeModal,
      getParams: this._getParams,
    }
  }

  static displayName = 'ModalProvider'

  componentDidMount() {
    const { stack } = this.props
    // @TODO: Add an example
    invariant(stack, 'You need to provide a stack prop to <ModalProvider>')
  }

  _openModal = (modalName: ModalName, params: ?Object) => {
    const { content, names } = this.props.stack

    invariant(modalName?.length > 0, "You didn't pass any modal name")
    invariant(
      names.some(name => name === modalName),
      // $FlowFixMe
      `'${modalName}' is not valid modal name. Did you mean any of these: ${names.map(
        validName => `\n• ${validName}`
      )}`
    )

    const stackItem = content.find(item => item.name === modalName)

    if (!this.state.currentModal) {
      BackHandler.addEventListener('hardwareBackPress', this._handleBackPress)
    }

    this.setState(state => ({
      currentModal: modalName,
      stack: {
        ...state.stack,
        openedItems: [
          ...state.stack.openedItems,
          {
            hash: `${modalName}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            ...stackItem,
            ...(params && { params }),
          },
        ],
      },
    }))
  }

  // TODO: Close specific modal
  // TODO: Remove specific params
  _closeModal = () => {
    const {
      defaultOptions: { backButtonBehavior },
    } = this.props.stack
    const stack = {
      ...this.state.stack,
      openedItems:
        this.state.stack.openedItems.length === 1 ||
        backButtonBehavior === 'clear'
          ? []
          : this.state.stack.openedItems.slice(
              0,
              this.state.stack.openedItems.length - 1
            ),
    }
    this.setState(
      state => ({ currentModal: null, stack }),
      () =>
        BackHandler.removeEventListener(
          'hardwareBackPress',
          this._handleBackPress
        )
    )
  }

  _getParams = (hash: string, fallback?: any): any => {
    const stackItem = this.state.stack.openedItems.find(
      item => item?.hash === hash
    )
    return stackItem.params || fallback
  }

  _handleBackPress = () => {
    const {
      defaultOptions: { backButtonBehavior },
    } = this.props.stack
    if (backButtonBehavior === 'none') return true
    else if (backButtonBehavior === 'pop' || backButtonBehavior === 'clear')
      this._closeModal()
    return true
  }

  render() {
    const { children } = this.props
    return (
      <ModalContext.Provider value={this.state}>
        <Fragment>
          <View style={{ flex: 1 }}>{children}</View>
          <ModalStack {...this.state} />
        </Fragment>
      </ModalContext.Provider>
    )
  }
}

export default ModalProvider
