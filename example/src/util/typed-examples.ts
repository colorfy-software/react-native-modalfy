import { modalfy, ModalProps, useModal } from 'react-native-modalfy'

export const useTypeDemos = () => {
  const { openModal } = useModal()

  // ==== Empty params ====

  openModal('IntroModal')
  openModal('IntroModal', undefined)

  // @ts-expect-error unnecessary params
  openModal('IntroModal', {})

  // ==== Optional params ====

  openModal('ModalD')
  openModal('ModalD', undefined)
  openModal('ModalD', {
    name: 'ModalD',
    color: 'darkgreen',
    origin: 'Plain JS',
  })

  // @ts-expect-error incorrect parameters
  openModal('ModalD', {
    name: 'ModalA',
    color: 'darkgreen',
    origin: 'Plain JS',
  })

  // ==== Required params ====

  openModal('ModalA', {
    name: 'ModalA',
    color: 'darkgreen',
    origin: 'Plain JS',
  })

  // @ts-expect-error incorrect parameters
  openModal('ModalA', {
    name: 'ModalB',
    color: 'darkgreen',
    origin: 'Plain JS',
  })
  // @ts-expect-error omitted parameters
  openModal('ModalA')
  // @ts-expect-error undefined parameters
  openModal('ModalA', undefined)
}

export const imperativeTypeDemos = () => {
  const { openModal } = modalfy()

  // ==== Empty params ====

  openModal('IntroModal')
  openModal('IntroModal', undefined)

  // @ts-expect-error unnecessary params
  openModal('IntroModal', {})

  // ==== Optional params ====

  openModal('ModalD')
  openModal('ModalD', undefined)
  openModal('ModalD', {
    name: 'ModalD',
    color: 'darkgreen',
    origin: 'Plain JS',
  })

  // @ts-expect-error incorrect parameters
  openModal('ModalD', {
    name: 'ModalA',
    color: 'darkgreen',
    origin: 'Plain JS',
  })

  // ==== Required params ====

  openModal('ModalA', {
    name: 'ModalA',
    color: 'darkgreen',
    origin: 'Plain JS',
  })

  // @ts-expect-error incorrect parameters
  openModal('ModalA', {
    name: 'ModalB',
    color: 'darkgreen',
    origin: 'Plain JS',
  })
  // @ts-expect-error omitted parameters
  openModal('ModalA')
  // @ts-expect-error undefined parameters
  openModal('ModalA', undefined)
}

export const ModalTypeDemoNoParams = ({ modal: { params } }: ModalProps<'IntroModal'>) => {
  const b: undefined = params

  return b
}

export const ModalTypeDemoRequiredParams = ({ modal: { params } }: ModalProps<'ModalA'>) => {
  const b: 'ModalA' = params.name

  return b
}

export const ModalTypeDemoOptionalParams = ({ modal: { params } }: ModalProps<'ModalD'>) => {
  const b: 'ModalD' | undefined = params?.name

  return b
}
