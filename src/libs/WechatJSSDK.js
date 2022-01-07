class WechatJSSDK {
    constructor(serverAddress) {
        if (!serverAddress) {
            throw new Error('serverAddress is required')
        }
        this.serverAddress = serverAddress
    }

    serverAddress = ''

    lastConfig = null

    scanQRCode (config = {}, seturl) {
        console.log(config)
        return this.configSDK({
            seturl,
        }).then(() => {
            return new Promise((resolve, reject) => {
                window.wx.ready(function() {
                    window.wx.scanQRCode({
                        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                        // scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                        scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
                        // ...config,
                        success: function (res) {
                            // var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                            resolve(res.resultStr)
                        },
                        error: function(error) {
                            console.log('sacn reject', error)
                            reject(error)
                        }
                    });
                })
            })
        }).catch(err => {
            console.log('scan err', err)
        })
    }

    setShare (shareConfig) {
        this.configSDK({}).then(() => {
            return new Promise((resolve, reject) => {
                window.wx.ready(function(){
                    console.log('wx.ready setshare')
                    window.wx.updateAppMessageShareData({
                        title: document.title, // 分享标题
                        desc: '', // 分享描述
                        link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: '', // 分享图标
                        ...shareConfig,
                        success: function () {
                          resolve()
                        },
                        error: function (error) {
                            console.log('share error', error)
                            reject(error)
                        }
                    })
                })
            })
        })
    }


    configSDK (config) {
        console.log('config sdk', config)
        if (!config.seturl) {
            config.seturl = location.href.split('#')[0]
        }
        if (this.lastConfig && config.seturl === this.lastConfig.url){
            return Promise.resolve(this.lastConfig)
        }
        let url = `${this.serverAddress}`
        if (config.seturl) {
            url = `${this.serverAddress}?seturl=${encodeURIComponent(config.seturl)}`
        }
        return fetch( url ,{
            method: 'GET',
        }).then((res) => res.json())
        .then((config) => {
            console.log('get config', config)
            config.debug = false
            delete config.beta
            this.lastConfig = config
            window.wx.config(config)
            window.wx.error(function(err) {
                console.log('config error', err)
            })
            return Promise.resolve(config)
        }).catch(err => {
            console.log('get config err', err.message)
            console.log(err)
        })
    }
}

export default new WechatJSSDK('http://token.biqianbao.net/api/wechat/jssdk')