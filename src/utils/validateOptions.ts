import type { ModalOptions } from '../types'

import invariant from './invariant'

export function validateStackItemOptions({
  animationIn,
  animationOut,
  animateInConfig,
  animateOutConfig,
}: ModalOptions = {}) {
  if (animationIn && animateInConfig) {
    console.warn(
      `You should defined either 'animationIn' or 'animateInConfig' but not both at once. 'animateInConfig' will be ignored as Modalfy defaults to 'animationIn'.`,
    )
  }

  if (animationOut && animateOutConfig) {
    console.warn(
      `You should defined either 'animationOut' or 'animateOutConfig' but not both at once. 'animateOutConfig' will be ignored as Modalfy defaults to 'animationOut'.`,
    )
  }
}

export default function validateDefaultOptions({
  position,
  animationIn,
  backBehavior,
  animationOut,
  animateInConfig,
  backdropOpacity,
  backdropPosition,
  animateOutConfig,
  transitionOptions,
  pointerEventsBehavior,
  backdropAnimationDuration,
}: ModalOptions = {}) {
  invariant(
    !backBehavior ||
      (backBehavior && backBehavior === 'clear') ||
      (backBehavior && backBehavior === 'none') ||
      (backBehavior && backBehavior === 'pop'),
    `backBehavior should either be 'pop', 'clear' or 'none' in createModalStack(), you provided: ${backBehavior}`,
  )
  invariant(
    !backdropAnimationDuration || (backdropAnimationDuration && typeof backdropAnimationDuration === 'number'),
    `backdropAnimationDuration should be a number in createModalStack(), you provided: ${backdropAnimationDuration}`,
  )
  invariant(
    !backdropOpacity ||
      (backdropOpacity && typeof backdropOpacity === 'number' && backdropOpacity >= 0 && backdropOpacity <= 1),
    `backdropOpacity should be a number between 0 and 1 in createModalStack(), you provided: ${backdropOpacity}`,
  )
  invariant(
    !backdropPosition ||
      (backdropPosition && backdropPosition === 'root') ||
      (backdropPosition && backdropPosition === 'belowLatest'),
    `backdropPosition should either be 'root' or 'belowLatest' in createModalStack(), you provided: ${backdropPosition}`,
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

  validateStackItemOptions({ animationIn, animationOut, animateInConfig, animateOutConfig })
}
