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
  getParams: (modalName: ModalName, fallback?: any) => any,
  closeModal: (modal?: ModalName) => void,
  openModal: (modalName: ModalName, params?: Object) => void,
  stack: Stack,
}

class ModalProvider extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { stack } = props

    this._handleBackPress = () => {
      const {
        defaultOptions: { backButtonBehavior },
      } = stack
      if (backButtonBehavior === 'none') return true
      else if (backButtonBehavior === 'pop' || backButtonBehavior === 'clear')
        this._closeModal()
      return true
    }

    this._openModal = (modalName: ModalName, params: ?Object) => {
      const { content, names } = props.stack
      invariant(modalName?.length > 0, "You didn't pass any modal name")
      invariant(
        names.some(name => name === modalName),
        // $FlowFixMe
        `'${modalName}' is not valid modal name. Did you mean any of these: ${names.map(
          validName => `\n• ${validName}`
        )}`
      )

      const stackItem = content.find(item => item.name === modalName)

      stack.openedItems = [...this.state.stack.openedItems, stackItem]
      stack.params = {
        ...(stack.params && stack.params),
        ...(params && { [modalName]: params }),
      }

      if (!this.state.currentModal) {
        BackHandler.addEventListener('hardwareBackPress', this._handleBackPress)
      }
      this.setState(() => ({ currentModal: modalName, stack }))
    }

    // TODO: Close specific modal
    // TODO: Remove specific params
    this._closeModal = () => {
      const {
        defaultOptions: { backButtonBehavior },
      } = props.stack
      const newStack = {
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
        state => ({ currentModal: null, stack: newStack }),
        () =>
          BackHandler.removeEventListener(
            'hardwareBackPress',
            this._handleBackPress
          )
      )
    }

    this._getParams = (modalName: ModalName, fallback?: any): any =>
      stack.params?.[modalName] || fallback

    this.state = {
      currentModal: null,
      stack,
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

  _openModal: (modalName: ModalName, params?: Object) => void
  _closeModal: (modal?: ModalName) => void
  _getParams: (modalName: ModalName, fallback?: any) => any
  _handleBackPress: Function

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
