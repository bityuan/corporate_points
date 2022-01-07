<template>
    <div class="modify-page">
        <van-cell-group class="bbd">
            <van-field :value="assetsOption[selectedAssets].text" label="币种" readonly/>
            <van-field
                v-model="contract.totalCount"
                clearable
                type="tel"
                label="激励总量"
                class="message-as-unit"
                :maxlength="10"
                :error-message="contract.totalCount | moneyDesc"
                placeholder="请输入激励总量"
            />

            <div v-if="selectedMeans === 'fixAmount'">
                <van-field
                    v-model="contract.fixAmount.amount"
                    clearable
                    type="tel"
                    label="单次解锁量"
                    class="message-as-unit"
                    :maxlength="10"
                    :error-message="contract.fixAmount.amount | moneyDesc"
                    placeholder="请输入单次解锁数量"
                />
                <van-field
                    v-model="contract.fixAmount.period"
                    clearable
                    type="tel"
                    label="解锁周期"
                    :maxlength="10"
                    placeholder="请输入解锁周期（天）"
                />
            </div>
            <div v-if="selectedMeans === 'leftProportion'">
                <van-field
                    v-model="contract.leftProportion.period"
                    clearable
                    label="解锁周期"
                    :maxlength="10"
                    type="tel"
                    placeholder="请输入解锁周期（天）"
                />
                <van-field
                    v-model="contract.leftProportion.tenThousandth"
                    clearable
                    type="tel"
                    label="解锁比例"
                    class="message-as-unit"
                    :maxlength="6"
                    :error-message="contract.leftProportion.tenThousandth | unitForLP"
                    placeholder="万分之？"
                />
            </div>
            <van-cell title="生效时间" is-link :value="contract.startTime | fulltime" @click="showDateTimePicker = true"/>
            <van-cell title="可否撤销" class="select-cell" v-if="false">
                <van-switch
                    active-color="#4CD964"
                    v-model="contract.isRevoke"
                />
            </van-cell>
        </van-cell-group>
        <van-cell-group class="mt10 bbd">
          <van-field :value="address"
                    label="发起地址"
                    readonly
                    placeholder="请输入发起地址"
                    >
          </van-field>
          <van-field v-model="toAddress"
                    label="受益人地址"
                    placeholder="请输入受益人地址"
                    error-message="受益地址不得填写交易所、托管等中心化地址"
                    >
            <template slot="right-icon">
                <van-icon name="scan" @click="doScan('toAddress')"/>
            </template>
          </van-field>
        <van-field
            v-model="contractName"
            clearable
            :maxlength="10"
            label="合约标签"
            placeholder="给合约取个名吧"
        />
        </van-cell-group>
        <van-button type="primary" size="large" class="confirmbtn" @click="submit" :loading="createLoading">确认发起</van-button>
        <van-popup v-model="showDateTimePicker" position="bottom" :overlay="true">
            <van-datetime-picker
                v-model="startTimeTemp"
                title="选择生效日期"
                type="date"
                cancel-button-text="取消"
                :formatter="formatter"
                @confirm="showDateTimePicker=false; contract.startTime = startTimeTemp;"
                @cancel="showDateTimePicker=false; startTimeTemp = contract.startTime;"
                :min-date="minDate"
            />
        </van-popup>
    </div>
</template>
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import scan from '@/libs/scan'
import sign from '@/libs/sign'
import app_config from '../../corporate_points.config'

import {chain33} from '@/store.js'
import { PAY_RECORD , createRecord } from '@/libs/storageList.js'
import polling from '@/mixins/polling.js'
export default {
    mixins: [polling],
    data () {
        return {
            // myAddress: '',
            selectedConfig: 0,
            createLoading: false,
            configOption: app_config,
            selectedAssets: 0,
            selectedMeans: 'fixAmount',
            meansOption: [
                { text: '固定数量', value: 'fixAmount' },
                { text: '固定比例', value: 'leftProportion' }
            ],
            showDateTimePicker: false,
            contractName: '',
            toAddress: '',
            minDate: new Date(),
            startTimeTemp: new Date(),
            contract: {
                isRevoke: true,
                totalCount: null,
                startTime: new Date(),
                fixAmount: {
                    period: null,
                    amount: null,
                },
                leftProportion: {
                    period: null,
                    tenThousandth: null,
                },
            }
        }
    },
    computed: {
        ...mapState(['provider','contractAddress','address','namespace','createByMeListdata']),
        ...mapGetters(['execName','coinsBalance','unfreezeBalance']),
        assetsOption () {
            return this.app_config.assetsOption
        },
    },
    mounted() {
        this.selectedConfig = app_config
    },
    methods: {
        ...mapMutations(['updateNamespace','updateProvider']),
        ...mapActions(['getContractAddress','getBalance','listUnfreezeByCreator','listUnfreezeByBeneficiary','getBlockTime']),
        formatter(type, value) {
            if (type === 'year') {
                return `${value}<small>年</small>`
            } else if (type === 'month') {
                return `${value}<small>月</small>`
            }
            return `${value}<small>日</small>`
        },
        handleConfigChange (value) {
            console.log(value)
            const { namespace, url } = this.configOption
            this.updateNamespace(namespace)
            this.updateProvider(url)
            const tempToast = this.$toast.loading({
                message: '正在切换...',
                forbidClick: true,
                duration: 0,
            })
            Promise.all([
                this.getContractAddress(),
                this.getBalance(),
            ]).then(()=>{
                setTimeout(() => {
                    tempToast.clear()
                }, 300);
            }).catch(e => {
                // 切换失败
                tempToast.clear()
                this.selectedConfig = 0
                this.$notify(e.message)
            })
        },
        doScan(field) {
            scan().then((res) => {
                this[field] = res
            }).catch((e) => {
                this.$notify(e)
            })
        },
        submit () {
            let contract = JSON.parse(JSON.stringify(this.contract))
            let postdata = {
                isRevoke: !contract.isRevoke
            }

            if (!/^\d+$/.test(contract.totalCount)) {
                return this.$toast('激励总量请填写整数')
            }
            postdata.totalCount = parseFloat(contract.totalCount)
            if (!postdata.totalCount || isNaN(postdata.totalCount)) {
                return this.$toast('请填写激励总量')
            }
            
            postdata.totalCount = Math.floor(postdata.totalCount * 1e8)

            // 检查余额是否足够
            // 这里默认是coins合约余额
            if (this.coinsBalance.balance < postdata.totalCount) {
                return this.$toast('余额不足')
            }

            const means = this.selectedMeans + ''
            postdata.means = means[0].toUpperCase() + means.substr(1)
            postdata[means] = contract[means]

            if (!/^\d+$/.test(postdata[means].period)) {
                return this.$toast('解锁周期请填写整数')
            }

            postdata[means].period = parseInt(postdata[means].period)
            if ( !postdata[means].period || isNaN(postdata[means].period)) {
                return this.$toast('请填写解锁周期')
            }
            
            // 天 转换为秒
            postdata[means].period = Math.floor(postdata[means].period * 24*60*60)
            if (means === 'fixAmount') {
                if (!/^\d+(\.\d?)?$/.test(postdata[means].amount)) {
                    return this.$toast('请填写正确的单次解锁量数字(最小精确到小数后1位)')
                }

                postdata[means].amount = parseFloat(postdata[means].amount)
                if ( !postdata[means].amount || isNaN(postdata[means].amount)) {
                    return this.$toast('请填写单次解锁量')
                }

                postdata[means].amount = Math.floor(postdata[means].amount * 1e8)
                if ( postdata.totalCount < postdata[means].amount ) {
                    return this.$toast('激励总量不可小于单次解锁量')
                }

            } else {
                postdata[means].tenThousandth = parseInt(postdata[means].tenThousandth)
                if ( !postdata[means].tenThousandth || isNaN(postdata[means].tenThousandth)) {
                    return this.$toast('请填写整数解锁比例')
                }
                if (postdata[means].tenThousandth >= 10000) {
                    return this.$toast('解锁比例需小于10%')
                }             
            }

            postdata.startTime = this.contract.startTime.getTime()

            postdata.startTime = Math.floor(postdata.startTime/1000)

            if (!this.toAddress) {
                return this.$toast('请填写受益人地址')
            }

            postdata.beneficiary = this.toAddress

            if ( postdata.beneficiary === this.address ) {
                return this.$toast('请勿给当前钱包地址创建激励')
            }

            if (this.contractName) {
                if (this.contractName.length > 10) {
                    return this.$toast('合约名称不可超过10个字符')
                }
                postdata.unfreezeLabel = this.contractName
            }

            const { assetSymbol, assetExec } = this.assetsOption[this.selectedAssets]
            
            postdata.assetSymbol = assetSymbol
            postdata.assetExec = assetExec

            console.log(postdata, "show postData")

            let tempToast = null

            // 构造交易
            // 先充值到合约
            // 创建解冻合约
            // 等待钱包/冷钱包签名

            this.createLoading = true

            const totalAmount = postdata.totalCount

            // 预计发送交易的大小为xxxByte
            // 一笔交易约为1024
            const txSize = 4096;
            Promise.all([
                chain33.getProperFee(2, txSize).then(({properFee}) => {
                    let postdata = {
                        "to":  this.contractAddress,
                        "amount": totalAmount,
                        "fee": Math.floor(properFee*Math.floor(txSize/1000 + 1)),
                        "isWithdraw": false,
                        "execName": this.execName
                    }
                    // 从合约提到coins
                    return chain33.createRawTransaction(postdata)
                }),
                chain33.createRawUnfreezeCreate(postdata)
            ]).then(txs => {
                return sign(txs.join(','), this.namespace)
            }).then( (res) => {
                console.log('after sign res', res)
                const {error, signHash} = res
                console.log('sendTransaction', signHash)
                if (error) throw new Error(error)
                return chain33.sendTransaction(signHash)

            }).then(txhash => {
                this.createLoading = false
                tempToast = this.$toast.loading({
                    message: '等待生效...',
                    forbidClick: true,
                    duration: 0,
                })
                return this.pollingForResult(txhash)
            }).then(successTxHash => {
                tempToast && tempToast.clear()
                if (successTxHash) {
                    // save in localstorage
                    this.$notify('执行成功！')
                    // successTxHash 为交易组中第二条交易的hash
                    // 此处 发起激励的交易 为第三条
                    chain33.queryTransaction(successTxHash).then(res => {
                        const recordHash = res.tx.next
                        this.$storageList.push(PAY_RECORD, createRecord(recordHash, `createUnfreeze-${this.contractName}`))
                    })

                    this.getBlockTime().then(() => {
                        this.listUnfreezeByCreator()
                        this.listUnfreezeByBeneficiary()
                    })
                    
                    this.$router.push('/list')
                } else {
                    this.$notify('执行失败')
                }
            }).catch(e => {
                this.createLoading = false
                this.$notify(e.message)
            })
        },
        // 充值
        recharge ( amount ) {
            console.log('this.contractAddress', this.contractAddress)
            return chain33.getProperFee().then(({properFee}) => {
                let postdata = {
                    "to":  this.contractAddress,
                    "amount": amount,
                    "fee": properFee*2,
                    "isWithdraw": false,
                    "execName": this.execName
                }
                // 从合约提到coins
                return chain33.createRawTransaction(postdata)
            }).then(txhex => {
                return sign(txhex, this.namespace)
            }).then(({error, signHash}) => {
                if (error) throw new Error(error)
                return chain33.sendTransaction(signHash)
            })
        },
        createUnfreeze (postdata) {
            return chain33.createRawUnfreezeCreate(postdata).then(txhex => {
                return sign(txhex, this.namespace)
            }).then(({error, signHash}) => {
                if (error) throw new Error(error)
                return chain33.sendTransaction(signHash)
            }) 
        }
    }
}
</script>
<style scoped>
.modify-page{
    min-height: 100vh;
    box-sizing: border-box;
    padding-bottom: 60px;
    background-color: #F9FAFF;
}
.confirmbtn {
    position: fixed;
    bottom: 0;
    left: 0;
    border-radius: 0;
    z-index: 1;
    height: 50px;
    background: linear-gradient(143deg, #FF7722 0%, #FE420F 100%);
}
</style>
