import { createContext } from 'react'

import { ModalContextProvider, ModalfyParams } from '../types'

const createModalContext = <ModalStackParamsList extends ModalfyParams>() => {
  const ModalContext = createContext<
    Partial<ModalContextProvider<ModalStackParamsList>>
  >({})
  ModalContext.displayName = 'Modalfy'

  return ModalContext
}

export default createModalContext()
