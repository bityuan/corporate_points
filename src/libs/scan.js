import WechatJSSDK from '@/libs/WechatJSSDK'
import { scanQRCode } from '@/libs/dsBridge'
import environment from '@/libs/environments'

export default function scan() {
  if (environment() === 'wallet') {
    return scanQRCode()
  } else if (environment() === 'weixin') {
    return WechatJSSDK.scanQRCode({
      needResult: 1,
      scanType: ['qrCode'],
    })
  } else {
    return Promise.reject('当前环境不支持扫码')
  }
}