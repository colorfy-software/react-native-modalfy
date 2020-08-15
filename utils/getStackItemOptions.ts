import { ModalStack, ModalStackItem, ModalOptions } from '../types'

export default function <P>(
  stackItem: ModalStackItem<P> | undefined,
  stack: ModalStack<P>,
): ModalOptions {
  const extractOption = <K extends keyof ModalOptions>(
    key: K,
  ): ModalOptions[K] =>
    stackItem?.component.modalOptions?.[key] ||
    stackItem?.options?.[key] ||
    stack.defaultOptions[key]

  return {
    disableFlingGesture: extractOption('disableFlingGesture'),
    transitionOptions: extractOption('transitionOptions'),
    animateOutConfig: extractOption('animateOutConfig'),
    shouldAnimateOut: extractOption('shouldAnimateOut'),
    backdropOpacity: extractOption('backdropOpacity'),
    animateInConfig: extractOption('animateInConfig'),
    containerStyle: extractOption('containerStyle'),
    backdropColor: extractOption('backdropColor'),
    backBehavior: extractOption('backBehavior'),
    animationOut: extractOption('animationOut'),
    animationIn: extractOption('animationIn'),
    position: extractOption('position'),
  }
}
