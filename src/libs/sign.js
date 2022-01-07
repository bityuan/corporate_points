
import { signRawTransaction } from '@/libs/dsBridge'
import environment from '@/libs/environments'

export default function sign(txhash, execer) {
  if (environment() === 'wallet') {
    console.log('wallet sign ~')
    return signRawTransaction(txhash, execer)
  } else {
    return Promise.reject('请在币钱包中打开')
  }
}