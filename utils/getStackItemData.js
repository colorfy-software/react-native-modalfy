/* @flow */

import { isValidElementType } from 'react-is'

export default function(modalName: string, modalComponent: any) {
  if (
    (modalComponent.modal && !isValidElementType(modalComponent.modal)) ||
    (!modalComponent.modal && !isValidElementType(modalComponent))
  ) {
    throw new Error(`The component for modal '${modalName}' must be a React component. For example:
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

  let options = undefined
  if (modalComponent.modal) {
    const { modal, ...rest } = modalComponent
    options = rest
  }

  return {
    name: modalName,
    component: modalComponent.modal || modalComponent,
    options,
  }
}
