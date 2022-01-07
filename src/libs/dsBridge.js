const jsBridge = window.jsBridge
export function getCurrentBTYAddress () {
  return new Promise((reslove, reject) => {
    new jsBridge().getCurrentBTYAddress({}, function(rlt){
      try {
        reslove(rlt)
      } catch (e) {
        reject(e)
      }
    });
  })
}

export function scanQRCode () {
  return new Promise((reslove, reject) => {
    new jsBridge().scanQRCode({
      needResult: 1,
      scanType: 1,
    }, function(rlt){
      try {
        reslove(rlt)
      } catch (e) {
        reject(e)
      }
    });
  })
}

export function signRawTransaction (createHash, exer) {
  return new Promise((reslove, reject) => {
    new jsBridge().signTxGroup({
      createHash,
      exer,
      withhold: 1,
    }, function(rlt){
      try {
        // android will return a string but ios will return a json object
        if (typeof rlt === "object") {
          reslove(rlt)
        } else {
          rlt = JSON.parse(rlt)
          reslove(rlt)
        }
      } catch (e) {
        reject(e)
      }
    });
  })
}
