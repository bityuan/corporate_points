const ANDROID = 1
const IOS = 2

export class JsBridge {
  bridgeName
  app

  isDebug = (process.env.NODE_ENV === 'development')

  constructor (bridgeName = 'WebViewJavascriptBridge') {
    this.bridgeName = bridgeName
    let ua = navigator.userAgent || navigator.vendor || window.opera
    ua = ua.toLowerCase()
    if(/android/.test(ua)){
      this.app = ANDROID
    } else if (/((iphone|ipad|ipod|ios))/.test(ua)) {
      this.app = IOS
    }
  }

  /*  与ios交互 */
  setupWebViewJavascriptBridge(callback) {
    // WebViewJavascriptBridge 由native在注入  
    // https://github.com/marcuswestin/WebViewJavascriptBridge
    if (window[this.bridgeName]) {
        return callback(window[this.bridgeName]);
    }
    if (window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback);
    }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = `https://__bridge_loaded__`;
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () {
        document.documentElement.removeChild(WVJBIframe);
    }, 0)
  }

  /* 与android交互 */
  /* https://github.com/lzyzsd/JsBridge */
  getAndroidBridge () {
    return new Promise(resolve => {
      if (window[this.bridgeName]) {
        resolve(window[this.bridgeName])
      } else {
        document.addEventListener(
          'WebViewJavascriptBridgeReady'
          , () => {
            resolve(window[this.bridgeName])
          },
          false
        )
      }
    })
  }

  /**
   * 给ios注册方法 jsHandler需要返回一个promise
   * @param {string} event
   * @param {fun} jsHandler
   * @return JSON对象
   */
  registerHandlerForIOS(event = '', jsHandler = '') {
    this.setupWebViewJavascriptBridge(function (bridge) {
      bridge.registerHandler(event, (data2js, responseCallback = () => {}) => {
        jsHandler(data2js).then(responseCallback)
      })
    })
  }

  /**
   * 给安卓注册方法 jsHandler需要返回一个promise
   * @param {string} event 
   * @param {fun} jsHandler 
   * @return JSON对象
   */
  registerHandlerForAndroid(event = '', jsHandler = '') {
    this.getAndroidBridge().then((bridge) =>{
      bridge.registerHandler(event, (data2js, responseCallback = () => {}) => {
        jsHandler(data2js).then(responseCallback)
      })
    })
  }

  /**
   * 调用ios
   * @param {string} event 
   * @param {object} params 
   * @param {fun} callback 
   * @return JSON对象
   */
  callIOSHandler(event, params = {}) {
    return new Promise(resolve => {
      this.setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler(event, params, resolve)
      })
    })
  }

  /**
   * 调用android
   * @param {string} event 
   * @param {object} params 
   * @param {fun} callback 
   * @return JSON对象
   */
  callAndroidHandler(event, params = {}) {
    return new Promise(resolve => {
      this.getAndroidBridge().then((bridge) =>{
        bridge.callHandler(event, params, (res) => {
          if ( typeof res === "string" && /{|\[/.test(res) ) {
            try {
              res = JSON.parse(res)
            } catch (error) {
              // console.error(error)
              throw error
            }
          }
          resolve(res)
        }) 
      })
    })
  }
  callHandler (event, params = {}) {
    if (this.app === IOS) {
      return this.callIOSHandler(event, params)
    } else if (this.app === ANDROID) {
      return this.callAndroidHandler(event, params)
    }
  }
}

const myJsBridge = new JsBridge()

/**
 * 调用app的扫码
 * 扫描结果是返回字符串
 * @param {*} [params={}]
 * @returns
 * @memberof jsBridge
 */
export function scanQRCode(params = {}) {
    const defaultParams = {
      needResult: 1, // 默认为1，扫描结果由h5处理 , 0则由app处理
      scanType: 1,   // 默认为1，扫描二维码， 0是一维码，2 其它场景码 暂不支持
    }
    return myJsBridge.callHandler('scanQRCode', {
      ...defaultParams,
      ...params
    })
}

/**
 * 调用錢包簽名功能
 * 扫描结果是返回{ signHash: 'txhash' }
 * @param {*} [params={}]
 * @returns
 * @memberof jsBridge
 */
export function signRawTransaction(txhash = '', execer = '') {
    if (myJsBridge.isDebug) return Promise.resolve('0a05636f696e7312131803220f108095f52a2208756e667265657a651a6e0801122103b7375ae2081d39617278cac3047c8224c3249962c13f2ff2a9a02ac0308cb1db1a473045022100c517f76a3d587ee528c44a4cb726a32c24aa60f9f22346cae83b3727db961d260220118f18c037d7dbc26f46d5a9a648f2daaba365caac757b23ff0f5273f859dad320a08d0628b9ddc0e80530ef90cdc5b1bdbc850f3a22314761485970576d71414a7371527772706f4e6342385676674b7453776a63487174')
    return myJsBridge.callHandler('signTxGroup', {
      createHash: txhash,
      exer: execer,
    })
}

/**
 * 获取当前钱包的bty的地址
 *
 * @returns
 * @memberof jsBridge
 */
export function getCurrentBTYAddress () {
    // zoe
    // if (myJsBridge.isDebug) return Promise.resolve('122hLo5xMrXy9tFiP4E6rejrYSvoUqDruo')
    if (myJsBridge.isDebug) return Promise.resolve('1DbpUkqdraP21wDxVT5otpBbV3oLkGfsAE')
    // qxw 1MBmStAsbtAgxuyoW9BrcjRbP8o1UAocq7
    // if (myJsBridge.isDebug) return Promise.resolve('1P7P4v3kL39zugQgDDLRqxzGjQd7aEbfKs')
    return myJsBridge.callHandler('getCurrentBTYAddress')
}