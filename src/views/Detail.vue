<template>
    <div class="detail-page" v-if="data">
        <div class="content">
            <div v-if="status === 0" class="flex-center banner"><img src="../assets/canceled.png" alt="canceled" srcset="../assets/canceled@2x.png 2x">已取消</div>
            <div v-else-if="status === 2" class="flex-center banner"><img src="../assets/workingon.png" alt="workingon" srcset="../assets/workingon@2x.png 2x">解冻完成</div>
            <div v-else class="flex-center banner"><img src="../assets/locked.png" alt="locked" srcset="../assets/locked@2x.png 2x">激励中</div>
            <van-cell-group class="num-group">
                <van-cell title="已解锁量">{{alreadyUnfreeze | formatCurrency}}{{coinSymbol | upper}}</van-cell>
                <van-cell title="剩余量">
                    <template slot>
                        {{data.totalCount - alreadyUnfreeze | formatCurrency}}{{coinSymbol | upper}}
                    </template>
                    <template slot="right-icon">
                        <van-button v-if="address === data.initiator && !data.terminate && status === 1" type="primary" size="small" class="grey" @click="terminate">取消合约</van-button>
                        <!-- <van-button v-if="address === data.beneficiary && data.remaining > 0 && status === 0" type="primary" size="small" @click="withdraw('remaining')">可提取</van-button> -->
                    </template>
                </van-cell>
                <van-cell title="解锁周期" :value="period"/>
            </van-cell-group>
            <van-cell-group class="pure-group">
                <van-cell title="解锁方式" :value="data | meansDesc" />
                <!-- <van-cell title="创建时间" :value="data.createTime" /> -->
                <van-cell title="生效时间" :value="data.startTime | formatTime"/>
                <van-cell title="所属链" :value="providerName"/>
                <van-cell title="合约地址" :value="contractAddress | filterHash"/>
                <van-cell title="发起地址" :value="data.initiator | filterHash"/>
                <van-cell title="受益人地址" :value="data.beneficiary | filterHash"/>
                <van-cell title="哈希ID" :value="txhash | filterHash">
                    <template slot="right-icon">
                        <van-button type="primary" 
                                    class="btn" 
                                    size="mini" 
                                    v-clipboard:copy="txhash"
                                    v-clipboard:success="copySuccess">复制</van-button>
                    </template>
                </van-cell>
            </van-cell-group>
        </div>
        <div class="title">
            <div class="left-line"></div>
            <div>记录</div>
            <div class="right-line"></div>
        </div>
        <div class="withdraw">
            <div class="tt">
                <div>时间</div>
                <div>数量</div>
                <div>状态</div>
            </div>
            <div v-if="data.availableAmount > 0 && address === data.beneficiary">
                <div> - </div>
                <div>{{data.availableAmount | formatCurrency}}{{coinSymbol | upper}}</div>
                <div><van-button type="primary" size="small" class="btn" @click="withdraw('availableAmount')">领取</van-button></div>
            </div>
            <div v-if="unfreezeRecordList.length === 0" class="list-placeholder">
                <span></span>
                <span>暂无记录</span>
                <span></span>
            </div>
            <div v-for="(item, i) in unfreezeRecordList" :key="i" class="unfreeze-record">
                <div>{{item.t | formatTime}}</div>
                <div>{{item.n}}</div>
                <div>{{item.a}}</div>
            </div>
            <div v-if="hasMore">
                <div></div>
                <div @click="moreRecord">更多</div>
                <div></div>
            </div>
        </div>
    </div>
</template>
<script>
import {mapState, mapGetters, mapActions} from 'vuex'
import { PAY_RECORD , createRecord } from '@/libs/storageList.js'
import {chain33} from '@/store.js'
import { formatTime } from '@/libs/filters.js'
import sign from '@/libs/sign'
import polling from '@/mixins/polling.js'
import txRecords from '@/mixins/txRecords.js'
import { contractStatus, unixTimeTransfer, calcUnfreezeRecordList } from '@/libs/filters.js'
export default {
    props: ['txhash'],
    mixins: [polling, txRecords],
    data () {
        return {
            loading: false,
            unfreezeRecordList: [],
            alreadyUnfreeze: 0,
            status: 0,
            data: null,
            hasMore: false
        }
    },
    watch: {
       mineListdata () {
           this.load()
       },
       createByMeListdata () {
           this.load()
       }
    },
    computed: {
        ...mapState(['contractAddress','address', 'namespace','blockTime','mineListdata','createByMeListdata']),
        ...mapGetters(['providerName','coinSymbol','execName']),
        id () {
            return this.txhash.substr(2)
        },
        period () {
            const means = this.data.fixAmount || this.data.leftProportion
            return unixTimeTransfer(means.period)
        }
    },
    mounted() {
        this.load()
    },
    methods: {
        ...mapActions(['getBalance']),
        load () {
            this.loading = true
            // find contractName from local
            const record = this.$storageList.data[PAY_RECORD].find(item => /createUnfreeze/.test(item.a) && item.h === this.txhash)
            const contractName = record ? record.a.split('-')[1] : null
            const createTime = record ? formatTime(record.t) : null

            return chain33.searchTreaty(this.id).then(result => {
                result.contractName = contractName
                result.createTime = createTime
                result.availableAmount = null
                result.startTime = Number(result.startTime)

                // find terminateTime from list
                if (this.address ===  result.beneficiary) {
                    const record = this.mineListdata.find(item => item.unfreezeID === result.unfreezeID )
                    if (record) {
                        result.terminateTime = record.terminateTime
                    }
                } else if (this.address === result.initiator) {
                    const record = this.createByMeListdata.find(item => item.unfreezeID === result.unfreezeID )
                    if (record) {
                        result.terminateTime = record.terminateTime
                    }
                }

                console.log('terminateTime', result.terminateTime)
                console.log(result, "show data(result)");
                this.data = result
                this.status = contractStatus(result, this.blockTime)
                const { alreadyUnfreeze, unfreezeRecordList, hasMore } = calcUnfreezeRecordList(result, this.blockTime)
                this.alreadyUnfreeze =  alreadyUnfreeze
                this.hasMore =  hasMore


                // 加入 提取记录
                let paylist = this.$storageList.data[PAY_RECORD].filter(item => /withdrawUnfreeze/.test(item.a) && item.h === this.txhash)
                                                                .map( item => {
                                                                    return {
                                                                        ...item,
                                                                        a: '提取',
                                                                        n: item.a.match(/\d+$/) && item.a.match(/\d+$/)[0]/1e8
                                                                    }
                                                                })
                console.log('paylist', paylist)
                this.unfreezeRecordList =  [...unfreezeRecordList, ...paylist].sort((a, b) => {return b.t - a.t})

                // 加入 提取记录
                
                return chain33.searchTreatyWithdraw(this.id)
            }).then(result => {
                const {availableAmount} = result
                console.log('availableAmount', availableAmount)
                this.data.availableAmount = availableAmount
                this.loading = false
            }).catch(e => {
                this.$notify(e.message)
                this.loading = false
            })
        },
        withdraw (key) {
            let tempToast
            let amount = 0

            if (key === 'remaining') {
                amount = Number(this.data.remaining)
            } else if (key === 'availableAmount') {
                amount = Number(this.data.availableAmount)
            }

            if (amount < 0) {
                return this.$notify('余额为负，请检查节点时间')
            }

            Promise.all([
                chain33.createRawUnfreezeWithdraw(this.id), // 从激励提到合约
                chain33.getProperFee().then(({properFee}) => {
                    let postdata = {
                        "to":  this.contractAddress,
                        "amount": amount,
                        "fee": properFee*2,
                        "isWithdraw": true,
                        "execName": this.execName
                    }
                    // 从合约提到coins
                    return chain33.createRawTransaction(postdata)
                })
            ]).then( txs => {
                return sign(txs.join(','), this.namespace)
            }).then(({error, signHash}) => {
                if (error) throw new Error(error)
                return chain33.sendTransaction(signHash)
            }).then(resHash => {
                tempToast = this.$toast.loading({
                    message: '等待生效...',
                    forbidClick: true,
                    duration: 0,
                })
                return this.pollingForResult(resHash)
            }).then(successHash => {
                console.log('successHash', successHash)
                if (successHash) {
                    tempToast && tempToast.clear()
                    this.$storageList.push(PAY_RECORD, createRecord(this.txhash, `withdrawUnfreeze-${amount}`))
                    this.$notify('执行成功！')
                    this.load()
                    this.getBalance()
                } else {
                    this.$notify('执行失败')
                    tempToast && tempToast.clear()
                }
            }).catch(e => {
                tempToast && tempToast.clear()
                this.$notify(e.message)
            })

            // chain33.createRawUnfreezeWithdraw(this.id).then(txhex => {
            //     // 从激励提到合约
            //     return sign(txhex, this.namespace)
            // }).then(({error, signHash}) => {
            //     if (error) throw new Error(error)
            //     return chain33.sendTransaction(signHash)
            // }).then(resHash => {
            //     // 只记录解锁成功的hash
            //     // successHash = resHash

            //     return chain33.getProperFee()
            // }).then(({properFee}) => {
            //     let postdata = {
            //         "to":  this.contractAddress,
            //         "amount": amount,
            //         "fee": properFee + 10000,
            //         "isWithdraw": true,
            //         "execName": this.execName
            //     }
            //     // 从合约提到coins
            //     return chain33.createRawTransaction(postdata)
            // }).then(txhex => {
            //     return sign(txhex, this.namespace)
            // }).then(({error, signHash}) => {
            //     if (error) throw new Error(error)
            //     return chain33.sendTransaction(signHash)
            // }).then(resHash => {
            //     tempToast = this.$toast.loading({
            //         message: '等待生效...',
            //         forbidClick: true,
            //         duration: 0,
            //     })
            //     return this.pollingForResult(resHash)
            // }).then(successHash => {
            //     if (successHash) {
            //         tempToast && tempToast.clear()
            //         this.$storageList.push(PAY_RECORD, createRecord(successHash, `withdrawUnfreeze`))
            //         this.$notify('执行成功！')
            //         this.load()
            //         this.getBalance()
            //     } else {
            //         this.$notify('执行失败')
            //         tempToast && tempToast.clear()
            //     }
            // }).catch(e => {
            //     tempToast && tempToast.clear()
            //     this.$notify(e.message)
            // })
        },
        terminate () {
            let tempToast

            // 计算撤销之后可提取的币

            const amount = this.data.totalCount - this.alreadyUnfreeze;
            console.log('amount', amount);

            Promise.all([
                chain33.createRawUnfreezeTerminate(this.id), // 撤销激励
                chain33.getProperFee().then(({properFee}) => { // 将撤销之后剩余的币提取出来
                    let postdata = {
                        "to":  this.contractAddress,
                        "amount": amount,
                        "fee": properFee*2,
                        "isWithdraw": true,
                        "execName": this.execName
                    }
                    // 从合约提到coins
                    return chain33.createRawTransaction(postdata)
                })
            ]).then( txs => {
                return sign(txs.join(','), this.namespace)
            // chain33.createRawUnfreezeTerminate(this.id).then(txhex => {
            //     return sign(txhex, this.namespace)
            }).then(({error, signHash}) => {
                if (error) throw new Error(error)
                return chain33.sendTransaction(signHash)
            }).then(resHash => {
                tempToast = this.$toast.loading({
                    message: '等待生效...',
                    forbidClick: true,
                    duration: 0,
                })
                return this.pollingForResult(resHash)
            }).then(successHash => {
                if (successHash) {
                    tempToast && tempToast.clear()
                    this.$storageList.push(PAY_RECORD, createRecord(successHash, `terminateUnfreeze`))
                    this.$notify('执行成功！')
                    this.load()
                    this.getBalance()
                } else {
                    tempToast && tempToast.clear()
                    this.$notify('执行失败')
                }
            }).catch(e => {
                tempToast && tempToast.clear()
                this.$notify(e.message)
            })
        },
        copySuccess () {
            this.$toast('复制成功')
        },
        moreRecord () {
            // calc more record
        }
    }
}
</script>
<style scoped>
.detail-page{
    min-height: 100vh;
    /* background:rgba(11,22,60,1); */
    background:#0A0A0B;
    overflow: hidden;
    color: #333649;
}
.detail-page .btn{
    background: linear-gradient(143deg, #FF7722 0%, #FE420F 100%);
    border-radius: 4px;
}
.detail-page .content {
    margin: 28px 16px;
    background-color: #ffffff;
    border-radius:6px;
    box-sizing: border-box;
    padding: 16px;
}
.detail-page .content .banner{
    flex-direction: column;
    padding-top: 8px;
    padding-bottom: 16px;
    font-size:18px;
    font-weight:600;
    color:rgba(51,54,73,1);
}
.detail-page .content .banner img{
    margin: 16px;
    vertical-align: top;
}
.title {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size:16px;
    font-weight:500;
    color:rgba(255,255,255,1);
    line-height:22px;
}
.title .left-line {
    width:33px;
    height:2px;
    background:linear-gradient(90deg,rgba(114,145,255,0) 0%,rgba(113,144,255,1) 100%);
    position: relative;
    margin-right: 10px;
}
.title .left-line:before{
    position: absolute;
    content: ' ';
    display: block;
    width: 4px;
    height: 4px;
    background-color: rgba(113,144,255,1);
    border-radius: 2px;
    top: -1px;
    right: 0;
}
.title .right-line {
    width:33px;
    height:2px;
    background:linear-gradient(90deg,rgba(113,144,255,1) 0%,rgba(114,145,255,0) 100%);;
    position: relative;
    margin-left: 10px;
}
.title .right-line:before{
    position: absolute;
    content: ' ';
    display: block;
    width: 4px;
    height: 4px;
    background-color: rgba(113,144,255,1);
    border-radius: 2px;
    top: -1px;
    left: 0;
}
.withdraw {
    margin: 20px 16px;
    /* background:rgba(11,22,60,1); */
    /* box-shadow:inset 0px 0px 11px 0px rgba(142,146,163,1); */
    border-radius:6px;
    font-size:14px;
    font-weight:400;
    color:rgba(142,146,163,1);
    line-height:20px;
    padding: 16px 14px 16px;

    
    background: #0A0A0B;
    box-shadow: 0px 0px 11px 0px #8E92A3;
    border: 1px solid #8E92A3;
}
.withdraw > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.withdraw > div > div {
    flex:0 0 30%;
}
.withdraw .tt {
    font-size:15px;
    font-weight:400;
    color:rgba(217,220,233,1);
    line-height:21px;
}
</style>
<style>
.detail-page .van-cell__title{
    text-align: left;
    flex: 0 0 80px;
}
.detail-page .van-cell__value{
    text-align: left;
}
.pure-group{
    padding-top: 16px;
}
.detail-page .van-cell{
    padding-left: 0;
    padding-right: 0;
    border-bottom: 1px solid rgba(217,220,233,1);
}
.pure-group .van-cell{
    padding-top: 0;
    padding-bottom: 0;
    border-bottom: 0 none;
}
.detail-page .van-cell:after{
    display: none;
}
.num-group .van-cell__value,.num-group .van-cell__title{
    font-size:15px;
    font-weight:500;
    color:rgba(51,54,73,1);
}
.pure-group .van-cell__value,.pure-group .van-cell__title{
    font-size:13px;
}
</style>

