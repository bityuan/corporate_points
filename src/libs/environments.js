export default function environment() {
  if (process.env.NODE_ENV === 'development') return 'wallet'
  let ua = navigator.userAgent || navigator.vendor
  ua = ua.toLowerCase()
  if(/wallet/.test(ua)){
    return 'wallet';
  } else if (/micromessenger/.test(ua)) {
    return 'weixin'
  } else {
    return 'others'
  }
}