import { BackHandler } from 'react-native'

import type {
  ModalfyParams,
  ModalStackItem,
  ModalStateListener,
  ModalInternalState,
  ModalStateSubscriber,
  ModalStateSubscription,
  ModalStateEqualityChecker,
  ModalPendingClosingAction,
  ModalState as ModalStateType,
  ModalStatePendingClosingAction,
} from '../types'

import { invariant, getStackItemOptions, defaultOptions } from '../utils'

const createModalState = (): ModalStateType<any> => {
  let state: ModalInternalState<any> = {
    currentModal: null,
    stack: {
      names: [],
      content: [],
      defaultOptions,
      openedItems: new Set(),
      pendingClosingActions: new Set(),
    },
  }
  const stateListeners: Set<() => void> = new Set()

  const setState = <P extends ModalfyParams>(
    updater: (currentState: ModalInternalState<P>) => ModalInternalState<P>,
  ) => {
    state = updater(getState())
    stateListeners.forEach(stateListener => stateListener())
    return state
  }

  const init = setState

  const getState = <P extends ModalfyParams>(): ModalInternalState<P> => state

  const addStateSubscriber = <P extends ModalfyParams>(
    stateSubscriber: ModalStateSubscriber<P>,
  ): ModalStateSubscription<P> => {
    function stateListener() {
      try {
        const currentState = getState<P>()
        if (!stateSubscriber.equalityFn(stateSubscriber.state, currentState)) {
          stateSubscriber.stateListener((stateSubscriber.state = currentState))
        }
      } catch (error) {
        stateSubscriber.error = true
        stateSubscriber.stateListener(null, error as Error)
      }
    }

    stateListeners.add(stateListener)

    return { unsubscribe: () => stateListeners.delete(stateListener) }
  }

  const createStateSubscriber = <P extends ModalfyParams>(
    stateListener: ModalStateListener<P>,
    equalityFn: ModalStateEqualityChecker<P>,
  ): ModalStateSubscriber<P> => ({
    equalityFn,
    error: false,
    stateListener,
    state: getState(),
    unsubscribe: () => true,
  })

  const subscribe = <P extends ModalfyParams>(
    stateListener: ModalStateListener<P>,
    equalityFn: ModalStateEqualityChecker<P> = Object.is,
  ): ModalStateSubscription<P> => addStateSubscriber(createStateSubscriber(stateListener, equalityFn))

  const openModal = <P extends ModalfyParams>({
    modalName,
    params,
    isCalledOutsideOfContext,
    callback,
  }: {
    modalName: Exclude<keyof P, symbol | number>
    params?: P
    isCalledOutsideOfContext?: boolean
    callback?: () => void
  }) => {
    const {
      currentModal,
      stack: { content, names },
    } = getState()

    invariant(modalName, "You didn't pass any modal name")
    invariant(
      names.some(name => name === modalName),
      `'${modalName}' is not a valid modal name. Did you mean any of these: ${names.map(
        validName => `\n• ${validName}`,
      )}`,
    )

    const stackItem = content.find(item => item.name === modalName)
    const hash = `${modalName}_${Math.random().toString(36).substring(2, 11)}`

    if (!currentModal && isCalledOutsideOfContext) {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress)
    }

    if (stackItem) {
      setState<P>(currentState => ({
        currentModal: modalName,
        stack: {
          ...currentState.stack,
          openedItems: currentState.stack.openedItems.add(
            Object.assign({}, stackItem, {
              ...stackItem,
              hash,
              callback,
              ...(params && { params }),
            }) as ModalStackItem<ModalfyParams>,
          ),
        },
      }))
    }
  }

  const getParam = <P extends ModalfyParams, N extends keyof P[keyof P], D extends P[keyof P][N]>(
    hash: ModalStackItem<P>['hash'],
    paramName: N,
    defaultValue?: D,
  ): D extends P[keyof P][N] ? P[keyof P][N] : undefined => {
    const {
      stack: { openedItems },
    } = getState()
    let stackItem: ModalStackItem<P> | undefined

    openedItems.forEach(item => {
      if (item.hash === hash) stackItem = item
    })

    return stackItem?.params?.[paramName] ?? defaultValue
  }

  const closeModal = <P extends ModalfyParams>(
    closingElement?: Exclude<keyof P, number | symbol> | ModalStackItem<P>,
  ) => {
    const {
      stack: { openedItems: oldOpenedItems, names },
    } = getState()
    const newOpenedItems = new Set(oldOpenedItems)

    if (typeof closingElement === 'string') {
      invariant(
        names.some(name => name === closingElement),
        `'${closingElement}' is not a valid modal name. Did you mean any of these: ${names.map(
          validName => `\n• ${String(validName)}`,
        )}`,
      )

      let wasItemRemoved = false
      const reversedOpenedItemsArray = Array.from(newOpenedItems).reverse()

      reversedOpenedItemsArray.forEach(openedItem => {
        if (openedItem.name === closingElement && !wasItemRemoved) {
          newOpenedItems.delete(openedItem)
          wasItemRemoved = true
        }
      })

      if (!wasItemRemoved) {
        console.warn(`There was no opened ${closingElement} modal.`)
      }
      // @ts-ignore
    } else if (closingElement && newOpenedItems.has(closingElement)) {
      // @ts-ignore
      newOpenedItems.delete(closingElement)
    } else {
      const staleStackItem = Array.from(newOpenedItems).pop()
      if (staleStackItem) newOpenedItems.delete(staleStackItem)
    }

    const newOpenedItemsArray = Array.from(newOpenedItems)

    setState(currentState => ({
      stack: { ...currentState.stack, openedItems: newOpenedItems },
      currentModal: newOpenedItemsArray?.slice(-1)[0]?.name,
    }))
  }

  const closeModals = <P extends ModalfyParams>(modalName: Exclude<keyof P, symbol>): boolean => {
    const {
      stack: { openedItems: oldOpenedItems, names },
    } = getState()

    invariant(modalName, "You didn't pass any modal name to closeModals()")
    invariant(
      names.some(name => name === modalName),
      `'${modalName}' is not a valid modal name. Did you mean any of these: ${names.map(
        validName => `\n• ${String(validName)}`,
      )}`,
    )

    const newOpenedItems = new Set(oldOpenedItems)

    newOpenedItems.forEach(item => {
      if (item.name === modalName) newOpenedItems.delete(item)
    })

    if (newOpenedItems.size !== oldOpenedItems.size) {
      const openedItemsArray = Array.from(newOpenedItems)
      setState(currentState => ({
        stack: { ...currentState.stack, openedItems: newOpenedItems },
        currentModal: openedItemsArray?.slice(-1)[0]?.name,
      }))
      return true
    }

    return false
  }

  const closeAllModals = () => {
    setState(currentState => ({
      currentModal: null,
      stack: { ...currentState.stack, openedItems: new Set() },
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

  const queueClosingAction = ({
    action,
    callback,
    modalName,
  }: ModalStatePendingClosingAction): ModalPendingClosingAction | null => {
    const {
      stack: { names, openedItems },
    } = getState()

    if (action !== 'closeAllModals' && modalName) {
      invariant(
        names.some(name => name === modalName),
        `'${modalName}' is not a valid modal name. Did you mean any of these: ${names.map(
          validName => `\n• ${validName}`,
        )}`,
      )
    }

    const noOpenedItems = !openedItems?.size

    if (noOpenedItems) {
      if (typeof callback === 'function') callback?.()
      return null
    }

    const hash = `${modalName ? `${modalName}_${action}` : action}_${Math.random().toString(36).substring(2, 11)}`

    const { pendingClosingActions } = setState(currentState => {
      const newPendingClosingActions = new Set(currentState.stack.pendingClosingActions)
      newPendingClosingActions.add({
        hash,
        action,
        callback,
        modalName,
        currentModalHash: [...currentState.stack.openedItems].slice(-1)[0]?.hash,
      } as ModalPendingClosingAction)

      return {
        ...currentState,
        stack: {
          ...currentState.stack,
          pendingClosingActions: newPendingClosingActions,
        },
      }
    }).stack

    return [...pendingClosingActions].slice(-1)[0]
  }

  const removeClosingAction = (action: ModalPendingClosingAction): boolean => {
    const {
      stack: { pendingClosingActions: oldPendingClosingActions },
    } = getState()

    const newPendingClosingActions = new Set(oldPendingClosingActions)

    if (newPendingClosingActions.has(action)) {
      newPendingClosingActions.delete(action)
    } else return false

    setState(currentState => ({
      ...currentState,
      stack: {
        ...currentState.stack,
        pendingClosingActions: newPendingClosingActions,
      },
    }))

    return true
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
  M extends Exclude<keyof P, symbol | number> = Exclude<keyof P, symbol | number>,
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
  currentModal: ModalState.getState<P>()?.currentModal ?? null,
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
    ModalState.openModal({ modalName, params, callback, isCalledOutsideOfContext: true }),
})

export default ModalState
