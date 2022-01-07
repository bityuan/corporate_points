export default {
    /**项目名称 */
    text: '',
    /**初始值 */
    value: 0,
    /**开源钱包部署地址 example:https://aiqianbao.net/fzmparanode/ */
    url: '',
    /**交易发送地址 example:http://token.aiqianbao.net/sendtx?txhash= */
    sendtoUrl_pre:'',
    /**合约执行名称  example:user.p.fzmstock */
    namespace: '',
    /**是否是平行链 如果合约运行在平行链请填 true */
    isParalle: true,
    /**基础币种名称 example:BTC */
    baseCoins: '',
    /**可选用的代币列表 example:[ { text: 'Bitcion', value: 0, assetSymbol: 'BTC', assetExec: 'coins' }] */
    assetsOption: []
}