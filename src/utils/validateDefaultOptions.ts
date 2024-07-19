import type { ModalOptions } from '../types'

import invariant from './invariant'

export default function ({
  position,
  backBehavior,
  backdropOpacity,
  transitionOptions,
  pointerEventsBehavior,
  backdropAnimationDuration,
  placePreviousModalsBelowBackdrop,
}: ModalOptions = {}) {
  invariant(
    !backBehavior ||
      (backBehavior && backBehavior === 'clear') ||
      (backBehavior && backBehavior === 'none') ||
      (backBehavior && backBehavior === 'pop'),
    `backBehavior should either be 'pop', 'clear' or 'none' in createModalStack(), you provided: ${backBehavior}`,
  )
  invariant(
    !pointerEventsBehavior ||
      (pointerEventsBehavior && pointerEventsBehavior === 'auto') ||
      (pointerEventsBehavior && pointerEventsBehavior === 'none') ||
      (pointerEventsBehavior && pointerEventsBehavior === 'current-modal-only') ||
      (pointerEventsBehavior && pointerEventsBehavior === 'current-modal-none'),
    `pointerEventsBehavior should either be 'auto', 'none', 'current-modal-only' or 'current-modal-none' in createModalStack(), you provided: ${pointerEventsBehavior}`,
  )
  invariant(
    !backdropOpacity ||
      (backdropOpacity && typeof backdropOpacity === 'number' && backdropOpacity >= 0 && backdropOpacity <= 1),
    `backdropOpacity should be a number between 0 and 1 in createModalStack(), you provided: ${backdropOpacity}`,
  )
  invariant(
    !backdropAnimationDuration || (backdropAnimationDuration && typeof backdropAnimationDuration === 'number'),
    `backdropAnimationDuration should be a number in createModalStack(), you provided: ${backdropAnimationDuration}`,
  )
  invariant(
    !position ||
      (position && position === 'top') ||
      (position && position === 'center') ||
      (position && position === 'bottom'),
    `position should either be 'top', 'center' or 'bottom' in createModalStack(), you provided: ${position}`,
  )
  invariant(
    !transitionOptions || (transitionOptions && typeof transitionOptions === 'function'),
    `transitionOptions should be a function. For instance:
      const defaultModalOptions = {
        transitionOptions: animatedValue => ({
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        }),
      }
      }`,
  )
  invariant(
    !placePreviousModalsBelowBackdrop ||
      (placePreviousModalsBelowBackdrop && typeof placePreviousModalsBelowBackdrop === 'boolean'),
    `placePreviousModalsBelowBackdrop should be a boolean in createModalStack(), you provided: ${placePreviousModalsBelowBackdrop}`,
  )
}
