import 'react-native-modalfy'
import { ModalStackParamsList } from './App'

// Add a such declaration file to make types work out of the box 👇
declare module 'react-native-modalfy' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ModalfyCustomParams extends ModalStackParamsList {}
}
