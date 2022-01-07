export default {
    /**项目名称 */
    text: '',
    /**初始值 */
    value: 0,
    /**开源钱包部署地址 example:https://aiqianbao.net/fzmparanode/ */
    url: 'https://biqianbao.net/fzmparanode/',
    /**交易发送地址 example:http://token.aiqianbao.net/sendtx?txhash= */
    sendtoUrl_pre:'http://token.biqianbao.net/sendtx?txhash=',
    /**合约执行名称  example:user.p.fzmstock */
    namespace: 'user.p.fzmstock.',
    /**是否是平行链 如果合约运行在平行链请填 true */
    isParalle: true,
    /**基础币种名称 example:BTC */
    baseCoins: 'FZM',
    /**可选用的代币列表 */
    assetsOption: [
        { text: 'FZM', value: 0, assetSymbol: 'FZM', assetExec: 'coins' }
    ]
}