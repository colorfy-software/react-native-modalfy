import type { ComponentType } from 'react'
import { isValidElementType } from 'react-is'

import type { ModalOptions } from '../types'

export default function <P>(
  modalName: Exclude<keyof P, symbol | number>,
  modalComponent: ComponentType<any> | ModalOptions,
) {
  if (
    ('modal' in modalComponent && !isValidElementType(modalComponent.modal)) ||
    ('modal' in modalComponent === false && !isValidElementType(modalComponent))
  ) {
    throw new Error(`The component for modal '${modalName}' must be a valid React component. For instance:
      import MyModal from './MyModal';
  
        ...
        ${modalName}: MyModal,
      }
  
      You can also use an object:
        ...
        ${modalName}: {
          modal: MyModal
        },
      }`)
  }

  let options
  let modalObj

  if ('modal' in modalComponent) {
    const { modal, ...rest } = modalComponent
    modalObj = modal
    options = rest
  }

  return {
    component: modalObj || modalComponent,
    name: modalName,
    options,
  }
}
