<template>
    <div class="info-board">
      <div>余额：{{coinsBalance.balance | formatCurrency }}{{coinSymbol | upper}}</div>
      <div>合约余额：{{unfreezeBalance.balance | formatCurrency }} <van-button type="primary" size="mini" @click="withdraw">提取到余额</van-button></div>
      <div>冻结中：{{unfreezeBalance.frozen | formatCurrency}} </div>
    </div>
</template>
<script>
import { mapActions, mapMutations, mapState, mapGetters} from 'vuex'
import { PAY_RECORD , createRecord } from '@/libs/storageList.js'
import sign from '@/libs/sign'
import polling from '@/mixins/polling.js'
import {chain33} from '@/store.js'
export default {
    name: 'DebugBoard',
    mixins: [polling],
    computed: {
        ...mapGetters(['unfreezeBalance','coinsBalance', 'coinSymbol','execName']),
        ...mapState(['contractAddress', 'namespace']),
    },
    methods:{
        ...mapActions(['getBalance']),
        ...mapMutations(['updateLoadingBalance']),
        withdraw () {
            this.updateLoadingBalance(true)
            return chain33.getProperFee().then(({properFee}) => {
                let postdata = {
                    "to":  this.contractAddress,
                    "amount": this.unfreezeBalance.balance,
                    "fee": properFee*2,
                    "isWithdraw": true,
                    "execName": this.execName
                }
                // 从合约提到coins
                return chain33.createRawTransaction(postdata)
            }).then(txhex => {
                return sign(txhex, this.namespace)
            }).then(({error, signHash}) => {
                if (error) throw new Error(error)
                return chain33.sendTransaction(signHash)
            }).then((txhash) => {
                this.$storageList.push(PAY_RECORD, createRecord(txhash, `withdrawFromUnfreezeToCoins`))
                return this.pollingForResult(txhash)
            }).then(isSuccess => {
                if (isSuccess) {
                    this.$notify('执行成功！')
                    return this.getBalance()
                } else {
                    this.$notify('执行失败')
                }
            }).catch(e => this.$notify(e.message))
        }
    }
}
</script>
<style scoped>

</style>
