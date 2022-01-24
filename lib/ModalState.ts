import { BackHandler } from 'react-native'

import {
  ModalState as ModalStateType,
  ModalStateEqualityChecker,
  ModalStateSubscription,
  ModalContextProvider,
  ModalStateSubscriber,
  ModalStateListener,
  ModalStackItem,
  ModalfyParams,
} from '../types'

import { invariant, getStackItemOptions } from '../utils'

const createModalState = (): ModalStateType<any> => {
  type State<P> = {
    currentModal: ModalContextProvider<P>['currentModal']
    stack: ModalContextProvider<P>['stack']
  }

  let listeners: Set<() => void> = new Set()
  let initialState: State<any>
  let state: State<any>

  const setState = <P>(
    updater: (currentState: ModalInternalState<P>) => ModalInternalState<P>,
  ) => {
    const newState = updater(state)
    state = {
      ...newState,
      stack: {
        ...newState.stack,
        openedItemsSize: newState.stack.openedItems.size,
        pendingClosingActionsSize: newState.stack.pendingClosingActions.size,
      },
    }
    listeners.forEach((listener) => listener())
    return state
  }

  const init = setState

  const getState = <P>(): State<P> => {
    const output: State<P> = state
    return output
  }

  const addSubscriber = <P>(
    subscriber: ModalStateSubscriber<P>,
  ): ModalStateSubscription<P> => {
    function listener() {
      try {
        const currentState = getState<P>()
        if (!subscriber.equalityFn(subscriber.state, currentState)) {
          subscriber.listener((subscriber.state = currentState))
        }
      } catch (error) {
        subscriber.error = true
        subscriber.listener(null, error as Error)
      }
    }

    listeners.add(listener)

    return {
      unsubscribe: () => {
        listeners.delete(listener)
      },
    }
  }

  const createSubscriber = <P>(
    listener: ModalStateListener<P>,
    equalityFn: ModalStateEqualityChecker<P>,
  ): ModalStateSubscriber<P> => ({
    unsubscribe: () => {},
    state: getState(),
    error: false,
    equalityFn,
    listener,
  })

  const subscribe = <P>(
    listener: ModalStateListener<P>,
    equalityFn: ModalStateEqualityChecker<P> = Object.is,
  ): ModalStateSubscription<P> =>
    addSubscriber(createSubscriber(listener, equalityFn))

  const openModal = <P>(
    modalName: Exclude<keyof P, symbol | number>,
    params?: P,
    isCalledOutsideOfContext?: boolean,
    callback?: () => void,
  ) => {
    const {
      stack: { content, names },
      currentModal,
    } = state

    invariant(modalName, "You didn't pass any modal name")
    invariant(
      names.some((name) => name === modalName),
      `'${modalName}' is not a valid modal name. Did you mean any of these: ${names.map(
        (validName) => `\n• ${validName}`,
      )}`,
    )

    const stackItem = content.find((item) => item.name === modalName)
    const hash = `${modalName}_${Math.random().toString(36).substr(2, 9)}`

    if (!currentModal && isCalledOutsideOfContext) {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress)
    }

    setState<P>((currentState) => ({
      currentModal: modalName,
      stack: {
        ...currentState.stack,
        openedItems: state.stack.openedItems.add(
          Object.assign({}, stackItem, {
            hash,
            callback,
            ...(params && { params }),
          }),
        ),
      } as ModalContextProvider<P>['stack'],
    }))
  }

  const getParam = <
    P extends ModalfyParams,
    N extends keyof P[keyof P],
    D extends P[keyof P][N],
  >(
    hash: ModalStackItem<P>['hash'],
    paramName: N,
    defaultValue?: D,
  ): D extends P[keyof P][N] ? P[keyof P][N] : undefined => {
    const {
      stack: { openedItems },
    } = state
    let stackItem: ModalStackItem<P> | undefined

    openedItems.forEach((item) => {
      if (item.hash === hash) stackItem = item
    })

    return stackItem?.params?.[paramName] || defaultValue
  }

  const closeModal = <P>(
    closingElement?: Exclude<keyof P, symbol> | ModalStackItem<P>,
  ) => {
    const {
      stack: { openedItems, names },
    } = state

    if (typeof closingElement === 'string') {
      invariant(
        names.some((name) => name === closingElement),
        `'${closingElement}' is not a valid modal name. Did you mean any of these: ${names.map(
          (validName) => `\n• ${String(validName)}`,
        )}`,
      )

      let wasItemRemoved = false
      let reversedOpenedItemsArray = Array.from(openedItems).reverse()

      reversedOpenedItemsArray.forEach((openedItem) => {
        if (openedItem.name === closingElement && !wasItemRemoved) {
          openedItems.delete(openedItem)
          wasItemRemoved = true
        }
      })

      if (!wasItemRemoved) {
        console.warn(`There was no opened ${closingElement} modal.`)
      }
    } else if (
      closingElement &&
      openedItems.has(closingElement as ModalStackItem<P>)
    ) {
      openedItems.delete(closingElement as ModalStackItem<P>)
    } else {
      const staleStackItem = Array.from(openedItems).pop()
      if (staleStackItem) openedItems.delete(staleStackItem)
    }

    const openedItemsArray = Array.from(openedItems)

    setState((currentState) => ({
      currentModal: openedItemsArray?.[openedItemsArray?.length - 1]?.name,
      stack: { ...currentState.stack, openedItems },
    }))
  }

  const closeModals = <P>(modalName: Exclude<keyof P, symbol>): boolean => {
    const {
      stack: { openedItems: oldOpenedItems, names },
    } = state

    invariant(modalName, "You didn't pass any modal name to closeModals()")
    invariant(
      names.some((name) => name === modalName),
      `'${modalName}' is not a valid modal name. Did you mean any of these: ${names.map(
        (validName) => `\n• ${String(validName)}`,
      )}`,
    )

    const newOpenedItems = new Set(oldOpenedItems)

    newOpenedItems.forEach((item) => {
      if (item.name === modalName) newOpenedItems.delete(item)
    })

    if (newOpenedItems.size !== oldOpenedItems.size) {
      const openedItemsArray = Array.from(newOpenedItems)
      setState((currentState) => ({
        currentModal: openedItemsArray?.[openedItemsArray?.length - 1]?.name,
        stack: { ...currentState.stack, openedItems: newOpenedItems },
      }))
      return true
    }

    return false
  }

  const closeAllModals = () => {
    const { openedItems } = state.stack

    openedItems.clear()

    setState((currentState) => ({
      currentModal: null,
      stack: { ...currentState.stack, openedItems },
    }))
  }

  const handleBackPress = (): boolean => {
    const { currentModal, stack } = getState()
    const currentModalStackItem = Array.from(stack.openedItems).pop()
    const { backBehavior } = getStackItemOptions(currentModalStackItem, stack)

    if (currentModal) {
      if (backBehavior === 'none') return true
      else if (backBehavior === 'clear') {
        queueClosingAction({ action: 'closeAllModals' })
        return true
      } else if (backBehavior === 'pop') {
        queueClosingAction({ action: 'closeModal', modalName: currentModal })
        return true
      }
    }

    return false
  }

  const queueClosingAction = <P>({
    action,
    callback,
    modalName,
  }: ModalStateType<P>['queueClosingAction']['arguments']): ModalStateType<P>['queueClosingAction']['arguments'] => {
    const {
      stack: { names },
    } = state

    if (action !== 'closeAllModals' && modalName) {
      invariant(
        names.some((name) => name === modalName),
        `'${modalName}' is not a valid modal name. Did you mean any of these: ${names.map(
          (validName) => `\n• ${validName}`,
        )}`,
      )
    }

    const hash = `${
      modalName ? `${modalName}_${action}` : action
    }_${Math.random().toString(36).substring(2, 11)}`

    const { pendingClosingActions } = setState((currentState) => ({
      ...currentState,
      stack: {
        ...currentState.stack,
        pendingClosingActions: currentState.stack.pendingClosingActions.add({
          hash,
          action,
          callback,
          modalName,
          currentModalHash: [...currentState.stack.openedItems].slice(-1)[0]
            .hash,
        }),
      },
    })).stack

    return [...pendingClosingActions].slice(-1)[0]
  }

  const removeClosingAction = (action: ModalPendingClosingAction): boolean => {
    const {
      stack: { pendingClosingActions: oldPendingClosingActions },
    } = state

    const newPendingClosingActions = new Set(oldPendingClosingActions)

    if (newPendingClosingActions.has(action)) {
      newPendingClosingActions.delete(action)
    }

    if (newPendingClosingActions.size !== oldPendingClosingActions.size) {
      setState((currentState) => ({
        ...currentState,
        stack: {
          ...currentState.stack,
          pendingClosingActions: newPendingClosingActions,
        },
      }))
      return true
    }

    return false
  }

  return {
    init,
    setState,
    getState,
    getParam,
    openModal,
    subscribe,
    closeModal,
    closeModals,
    closeAllModals,
    handleBackPress,
    queueClosingAction,
    removeClosingAction,
  }
}

const ModalState = createModalState()

/**
 * Function that exposes Modalfy's API outside of React's context.
 *
 * Note: Do not use if you're inside a React component.
 * Please consider `useModal()` or `withModal()` instead.
 *
 * @returns Object containing all the functions and variables of the usual `modal` prop.
 *
 * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/modalfy
 */
export const modalfy = <
  P extends ModalfyParams,
  M extends Exclude<keyof P, symbol | number> = Exclude<
    keyof P,
    symbol | number
  >,
>() => ({
  /**
   * This function closes every open modal.
   *
   * @example modalfy().closeAllModals(() => console.log('All modals closed'))
   *
   * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#closeallmodals
   */
  closeAllModals: (callback?: () => void) => {
    ModalState.queueClosingAction({ action: 'closeAllModals', callback })
  },
  /**
   * This function closes the currently displayed modal by default.
   *
   * You can also provide a `modalName` if you want to close a different modal
   * than the latest opened. This will only close the latest instance of that modal,
   * see `closeModals()` if you want to close all instances.
   *
   * @example modalfy().closeModal('ExampleModal', () => console.log('Current modal closed'))
   *
   * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#closemodal
   */
  closeModal: (modalName?: M, callback?: () => void) => {
    ModalState.queueClosingAction({
      action: 'closeModal',
      modalName,
      callback,
    })
  },
  /**
   * This function closes all the instances of a given modal.
   *
   * You can use it whenever you have the same modal opened
   * several times, to close all of them at once.
   *
   * @example modalfy().closeModals('ExampleModal', () => console.log('All ExampleModal modals closed'))
   *
   * @returns { boolean } Whether or not Modalfy found any open modal
   * corresponding to `modalName` (and then closed them).
   *
   * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#closemodals
   */
  closeModals: (modalName: M, callback?: () => void) => {
    ModalState.queueClosingAction({
      action: 'closeModals',
      modalName,
      callback,
    })
  },
  /**
   * This value returns the current open modal (`null` if none).
   *
   * @example modalfy().currentModal
   *
   * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#currentmodal
   */
  currentModal: ModalState.getState<P>()?.currentModal,
  /**
   * This function opens a modal based on the provided `modalName`.
   *
   * It will look at the stack passed to `<ModalProvider>` and add
   * the corresponding component to the current stack of open modals.
   * Alternatively, you can also provide some `params` that will be
   * accessible to that component.
   *
   * @example modalfy().openModal('PokédexEntryModal', { id: 619, name: 'Lin-Fu' }, () => console.log('PokédexEntryModal modal opened'))
   *
   * @see https://colorfy-software.gitbook.io/react-native-modalfy/api/types/modalprop#openmodal
   */
  openModal: (modalName: M, params?: P[M], callback?: () => void) =>
    ModalState.openModal(modalName, params, true, callback),
})

export default ModalState
