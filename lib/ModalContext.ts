import React from 'react'

import { ModalContextProvider, ModalfyParams } from '../types'

const createContext = <ModalStackParamsList extends ModalfyParams>() => {
  const ModalContext = React.createContext<
    Partial<ModalContextProvider<ModalStackParamsList>>
  >({})
  ModalContext.displayName = 'Modalfy'

  return ModalContext
}

export default createContext()
