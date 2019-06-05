/* @flow */

import React, { Fragment, Component } from 'react'
import { BackHandler, View } from 'react-native'

import type {
  EventName,
  EventSubscription,
  ModalEventListeners,
  ModalName,
  Stack,
  StackItem,
} from '../types'
import { invariant, validateListener } from '../utils'
import ModalContext from './ModalContext'
import ModalStack from './ModalStack'

type Props = {
  children: React$Element<*>,
  stack: Stack<Set<StackItem>>,
}

type State = {
  currentModal: ?ModalName,
  closeAllModals: (modalName: ModalName) => void,
  closeModal: (stackItem: StackItem) => void,
  getParams: (hash: ?string, fallback?: any) => any,
  openModal: (modalName: ModalName, params?: Object) => void,
  stack: Stack<Set<StackItem>>,
}

class ModalProvider extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      currentModal: null,
      stack: props.stack,
      openModal: this._openModal,
      closeAllModals: this._closeAllModals,
      closeModal: this._closeModal,
      getParams: this._getParams,
    }
  }

  static displayName = 'ModalProvider'

  modalEventListeners: ModalEventListeners = new Set()

  componentDidMount() {
    const { stack } = this.props
    invariant(stack, 'You need to provide a stack prop to <ModalProvider>')
  }

  _clearListeners = (hash: string) => {
    this.modalEventListeners.forEach(item => {
      if (item.event.includes(hash)) this.modalEventListeners.delete(item)
    })
  }

  _openModal = (modalName: ModalName, params: ?Object) => {
    const { content, openedItems, names } = this.state.stack

    invariant(modalName?.length > 0, "You didn't pass any modal name")
    invariant(
      names.some(name => name === modalName),
      // $FlowFixMe
      `'${modalName}' is not a valid modal name. Did you mean any of these: ${names.map(
        validName => `\n• ${validName}`
      )}`
    )

    const stackItem = content.find(item => item.name === modalName)
    const hash = `${modalName}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    if (!this.state.currentModal) {
      BackHandler.addEventListener('hardwareBackPress', this._handleBackPress)
    }

    this.setState(state => ({
      currentModal: modalName,
      stack: {
        ...state.stack,
        openedItems: state.stack.openedItems.add({
          ...stackItem,
          hash,
          ...(params && { params }),
        }),
      },
    }))
  }

  _closeAllModals = (modalName: ModalName) => {
    const { openedItems: oldOpenedItems, names } = this.state.stack

    invariant(
      modalName?.length > 0,
      "You didn't pass any modal name to closeAllModals()"
    )
    invariant(
      names.some(name => name === modalName),
      // $FlowFixMe
      `'${modalName}' is not a valid modal name. Did you mean any of these: ${names.map(
        validName => `\n• ${validName}`
      )}`
    )

    const newOpenedItems = new Set(oldOpenedItems)

    newOpenedItems.forEach(item => {
      if (item.name === modalName) newOpenedItems.delete(item)
    })

    if (newOpenedItems.size !== oldOpenedItems.size) {
      this.setState(state => ({
        stack: { ...state.stack, openedItems: newOpenedItems },
      }))
    }
  }

  // TODO: Close specific modal
  _closeModal = (stackItem: StackItem) => {
    const {
      defaultOptions: { backButtonBehavior },
      openedItems,
    } = this.state.stack

    openedItems.delete(stackItem)

    this.setState(
      state => ({
        currentModal: null,
        stack: { ...state.stack, openedItems },
      }),
      () =>
        BackHandler.removeEventListener(
          'hardwareBackPress',
          this._handleBackPress
        )
    )
  }

  _getParams = (hash: ?string, fallback?: any): any => {
    const { openedItems } = this.state.stack
    let stackItem

    openedItems.forEach(item => {
      if (item.hash === hash) stackItem = item
    })

    return stackItem?.params || fallback
  }

  _handleBackPress = () => {
    const {
      defaultOptions: { backButtonBehavior },
      openedItems,
    } = this.state.stack

    if (backButtonBehavior === 'none') return true
    else if (backButtonBehavior === 'clear') {
      this.setState(state => ({
        stack: { ...state.stack, openedItems: new Set() },
      }))
    } else if (backButtonBehavior === 'pop') {
      const openedItemsArray = [...openedItems]
      this._closeModal(openedItemsArray.slice(-1)[0])
    }

    return true
  }

  _registerListener = (
    hash: string,
    eventName: EventName,
    handler: () => void
  ): EventSubscription => {
    validateListener('add', { eventName, handler })
    const newListener = {
      event: `${hash}_${eventName}`,
      handler,
    }

    this.modalEventListeners.add(newListener)

    return {
      remove: () => this.modalEventListeners.delete(newListener),
    }
  }

  render() {
    const { children } = this.props
    return (
      <ModalContext.Provider value={this.state}>
        <Fragment>
          <View style={{ flex: 1 }}>{children}</View>
          <ModalStack
            {...this.state}
            eventListeners={this.modalEventListeners}
            registerListener={this._registerListener}
            clearListeners={this._clearListeners}
          />
        </Fragment>
      </ModalContext.Provider>
    )
  }
}

export default ModalProvider
