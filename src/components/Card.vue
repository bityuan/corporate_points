<template>
    <div :class="['card', {'active': status === 1}]" @click="jumpToDetail(data.txhash)">
        <div class="left coin-icon">
            <!-- <img src="../assets/bty_icon.png" alt="icon"> -->
            <!-- <img alt="icon" src="data:image/png;base64,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"> -->
            <img alt="icon" :src="icon">
        </div>
        <div class="right">
            <div class="f-item">
                <div v-if="data.unfreezeLabel" class="contract-name">{{data.unfreezeLabel}}</div>
                <div v-else-if="data.contractName" class="contract-name">{{data.contractName}}</div>
                <div v-else class="hash">{{data.beneficiary | filterHash}}</div>
                <van-tag v-if="status === 0" color="#D9DCE9" :disabled="true">已取消</van-tag>
                <van-tag v-else-if="status === 2" color="#D9DCE9" :disabled="true">已完成</van-tag>
                <van-tag v-else color="#C79F6D">激励中</van-tag>
            </div>
            <div class="f-item pt10">
                <div class="t">已解冻/激励总数（{{data.assetSymbol | upcase}}）</div>
                <div class="t">解冻间隔</div>
            </div>
            <div class="f-item num">
                <div class="breakall">
                    {{alreadyUnfreeze | floorNum }}<small>{{alreadyUnfreezeUnit}}</small>/{{total}}<small>{{totalUnit}}</small>
                </div>
                <div class="t-primary" :class="status ===1 ? 'highlight': ''">
                    {{period}}<small>{{periodUnit}}</small>
                </div>
            </div>
            <div class="t pt10">
                生效时间：{{ data.startTime | formatTime }}
            </div>
        </div>
    </div>
</template>
<script>
import { contractStatus, unixTimeTransfer, calcUnfreezeRecordList, numWithUnit  } from '@/libs/filters.js'
import icon from "../assets/fzm.png"
import { mapState } from 'vuex'
export default {
    name: 'Card',
    props: {
        data: {
            type: Object,
            // default(){
            //     return {
            //         "unfreezeLabel": "xxx的激励",
            //         "txhash": "0xf81112531bc3a4d4ac1203c2081a0abafb4ccc5f562086b790f27d08598c2ac5",
            //         "unfreezeID": "mavl-unfreeze-f81112531bc3a4d4ac1203c2081a0abafb4ccc5f562086b790f27d08598c2ac5",
            //         "startTime": "1561117800",
            //         "assetExec": "coins",
            //         "assetSymbol": "bty",
            //         "totalCount": "90000000",
            //         "initiator": "1DbpUkqdraP21wDxVT5otpBbV3oLkGfsAE",
            //         "beneficiary": "1P7P4v3kL39zugQgDDLRqxzGjQd7aEbfKs",
            //         "remaining": "90000000",
            //         "means": "FixAmount",
            //         "fixAmount": {
            //             "period": "60",
            //             "amount": "9000000"
            //         },
            //         "terminated": false,
            //         "availableAmount": null
            //     }
            // }
        },
    },
    filters: {
        upcase(v) {
            return v.toUpperCase()
        },
    },
    computed: {
        ...mapState(['blockTime']),
        period () {
            const means = this.data.fixAmount || this.data.leftProportion
            return unixTimeTransfer(means.period).split(' ')[0]
        },
        periodUnit () {
            const means = this.data.fixAmount || this.data.leftProportion
            return unixTimeTransfer(means.period).split(' ')[1]
        },
        status () {
            return contractStatus(this.data, this.blockTime)
        },
    },
    data () {
        return {
            alreadyUnfreeze: 0,
            alreadyUnfreezeUnit: '',
            total: 0,
            totalUnit: '',
            icon
        }
    },
    methods: {
        jumpToDetail (txhash) {
            this.$router.push(`/view/${txhash}`)
        }
    },
    mounted () {
        let {alreadyUnfreeze} = calcUnfreezeRecordList(this.data, this.blockTime)
        alreadyUnfreeze = alreadyUnfreeze/1e8
        const res = numWithUnit(alreadyUnfreeze).split(' ')
        this.alreadyUnfreeze = res[0]        
        this.alreadyUnfreezeUnit = res[1]
        const totalres = numWithUnit(this.data.totalCount/1e8).split(' ')
        this.total = totalres[0]
        this.totalUnit = totalres[1]
    }
}
</script>
<style scoped>
.card{
    background-color: #ffffff;
    box-sizing: border-box;
    margin-left: 16px;
    margin-right: 16px;
    margin-bottom: 14px;
    box-shadow:0px 1px 10px 0px rgba(217,220,233,0.5);
    border-radius:6px;
    border-left: 5px solid #D9DCE9;
    padding: 12px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.card.active {
    border-left-color: #C79F6D;
}
.card .left{
    flex: 0 0 auto;
    margin-right: 16px;
}
.card .left img{
    width: 42px;
    height: 42px;
    border-radius: 50%;
}
.card .right{
    width: 100%;
    flex: 1 1 auto;
    text-align: left;
}
.card .f-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.card .f-item>div:first-child{
    width: 64%;
    flex: 0 0 auto;
    text-align: left;
}
.card .f-item>div:last-child{
    width: 36%;
    flex: 0 0 auto;
}
.contract-name{
    font-size:14px;
    font-weight:400;
    color:rgba(142,146,163,1);
    line-height:20px;
}
.t {
    font-size:12px;
    font-weight:400;
    color:rgba(142,146,163,1);
    line-height:17px;
    text-align: left;
}
.num{
    font-weight:bold;
    font-size:22px;
    line-height:26px;
}
.num small{
    font-size: 12px;
}
.hash{
    font-size:14px;
    font-weight:400;
    color:rgba(51,54,73,1);
    line-height:20px;
}
.highlight{
    color: #FE420F;
}
</style>
