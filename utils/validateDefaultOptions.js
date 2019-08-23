/* @flow */

import type { Options } from '../types'
import invariant from './invariant'

export default function(customDefaultOptions: Options = {}) {
  const {
    backButtonBehavior,
    backdropOpacity,
    position,
    transitionOptions,
  } = customDefaultOptions

  invariant(
    !backButtonBehavior ||
      ((backButtonBehavior && backButtonBehavior === 'clear') ||
        (backButtonBehavior && backButtonBehavior === 'none') ||
        (backButtonBehavior && backButtonBehavior === 'pop')),
    "backButtonBehavior should either be 'pop', 'clear' or 'none' in createModalStack()"
  )
  invariant(
    !backdropOpacity ||
      (backdropOpacity &&
        typeof backdropOpacity === 'number' &&
        backdropOpacity >= 0 &&
        backdropOpacity <= 1),
    'backdropOpacity should be a number between 0 and 1 in createModalStack()'
  )
  invariant(
    !position ||
      ((position && position === 'top') ||
        (position && position === 'center') ||
        (position && position === 'bottom')),
    "position should either be 'top', 'center' or 'bottom' in createModalStack()"
  )
  invariant(
    !transitionOptions ||
      (transitionOptions && typeof transitionOptions === 'function'),
    `transitionOptions should be a function. For example:
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
      }`
  )
}
