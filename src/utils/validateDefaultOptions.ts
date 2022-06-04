import type { ModalOptions } from '../types'

import invariant from './invariant'

export default function ({
  position,
  backBehavior,
  backdropOpacity,
  transitionOptions,
  backdropAnimationDuration,
}: ModalOptions = {}) {
  invariant(
    !backBehavior ||
      (backBehavior && backBehavior === 'clear') ||
      (backBehavior && backBehavior === 'none') ||
      (backBehavior && backBehavior === 'pop'),
    "backBehavior should either be 'pop', 'clear' or 'none' in createModalStack()",
  )
  invariant(
    !backdropOpacity ||
      (backdropOpacity && typeof backdropOpacity === 'number' && backdropOpacity >= 0 && backdropOpacity <= 1),
    'backdropOpacity should be a number between 0 and 1 in createModalStack()',
  )
  invariant(
    !backdropAnimationDuration || (backdropAnimationDuration && typeof backdropAnimationDuration === 'number'),
    'backdropAnimationDuration should be a number in createModalStack()',
  )
  invariant(
    !position ||
      (position && position === 'top') ||
      (position && position === 'center') ||
      (position && position === 'bottom'),
    "position should either be 'top', 'center' or 'bottom' in createModalStack()",
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
}
