<template>
    <div class="list-page">
        <!-- <div class="reload-btn"><van-icon @click="reload" name="replay" :disabled="loadingCreateByme || loadingMine"/></div> -->
        <Slogen class="list-slogen" :width="150"/>
        <van-tabs v-model="activeTab" type="card" @change="onchange">
            <van-tab title="发起的激励">
                <van-list
                    :value="true"
                    :finished="true"
                    finished-text=""
                    @load="listUnfreezeByCreator"
                    >
                    <Card
                        v-if="!loadingCreateByme"
                        v-for="(item, i) in createByMeListdata"
                        :key="i"
                        :data="item"
                    />
                </van-list>
                <div v-if="createByMeListdata.length === 0" class="list-placeholder">暂无数据</div>
            </van-tab>
            <van-tab title="我的激励">
                <!-- <div class="flex-center">
                    <van-button plain hairline type="primary" class="bgtrans mb30" size="mini" @click="showImportDialog=true">+ 导入</van-button>
                </div> -->
                <van-list
                    :value="loadingMine"
                    :finished="true"
                    finished-text=""
                    @load="listUnfreezeByBeneficiary"
                    >
                    <Card
                        v-if="!loadingMine"
                        v-for="(item, i) in mineListdata"
                        :key="i"
                        :data="item"
                    />
                </van-list>
                <div v-if="mineListdata.length === 0" class="list-placeholder">暂无数据</div>
            </van-tab>
        </van-tabs>
        <van-dialog
            v-model="showImportDialog"
            show-cancel-button
            title="导入合约"
            :before-close="beforeCloseImportDialog"
            className="import-dialog"
            >
            <van-cell-group>
                <van-field v-model="importContractName" placeholder="请输入合约名称" />
                <van-field v-model="hashId" placeholder="请输入哈希ID" />
            </van-cell-group>
        </van-dialog>
        <van-button type="primary" size="large" class="btn-bottom" to="/modify" >发起激励</van-button>
    </div>
</template>
<script>
import Slogen from '@/components/Slogen.vue'
import Card from '@/components/Card.vue'
import { PAY_RECORD, createRecord } from '@/libs/storageList.js'
import {chain33} from '@/store.js'
import { mapState, mapActions } from 'vuex';
export default {
    components: {
        Slogen,
        Card
    },
    props: ['type'],
    data () {
        return {
            activeTab: 0,
            showImportDialog: false,
            hashId: '',
            importContractName: '',
        }
    },
    computed: {
        ...mapState(['loadingCreateByme', 'loadingMine', 'createByMeListdata', 'mineListdata']),
    },
    mounted() {
        this.reload()
        if (this.type == 1) {
            this.activeTab = 1
        } else {
            this.activeTab = 0
        }
    },
    methods: {
        ...mapActions(['listUnfreezeByCreator','listUnfreezeByBeneficiary']),
        reload () {
            this.listUnfreezeByCreator()
            this.listUnfreezeByBeneficiary()
        },
        onchange (v) {
            console.log(v)
            // this.$router
            this.$router.replace(`/list/${v}`)
        },
        beforeCloseImportDialog (action, done) {
            if (action === 'confirm') {
                // TODO 确定交易存在
                if (!this.hashId) {
                    done(false)
                    return this.$toast('请输入哈希ID')
                }
                // 本地查重
                if ( this.mineListdata.find(item => item.txhash === this.hashId)) {
                    done(false)
                    return this.$toast('交易已存在')
                }
                const tempToast = this.$toast.loading({
                    message: '正在验证...',
                    forbidClick: true,
                    duration: 0,
                })
                
                chain33.queryTransaction(this.hashId).then(res => {
                    if (res.receipt.ty === 2) {
                        setTimeout(() => {                        
                            tempToast.clear()
                        }, 300);
                        // 导入成功
                        this.$storageList.push(PAY_RECORD, createRecord(this.hashId, `importUnfreeze-${this.importContractName}`, res.blockTime*1000 ))
                        this.loadMine()
                        done()
                    } else {
                        setTimeout(() => {                        
                            tempToast.clear()
                            this.$notify('此笔交易打包失败')
                            done(false)
                        }, 300); 
                    }
                }).catch(e => {
                    setTimeout(() => {
                        tempToast.clear()
                        this.$notify(e.message)
                    }, 300);
                    done()
                })
            } else {
                done()
            }
        }
    }
}
</script>
<style>
.list-page{
    min-height: 100vh;
    background-image: url('../assets/bg_home.png');
    background-size: 100% 100%;
    overflow: hidden;
    padding-bottom: 60px;
    box-sizing: border-box;
}
.list-slogen{
    margin-top: 38px;
}
.list-slogen + div{
    margin-top: 26px;
}
.btn-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    background: linear-gradient(143deg, #FF7722 0%, #FE420F 100%) !important;
    border-radius: 0!important;
}
.reload-btn{
    position: fixed;
    top: 6px;
    left: 6px;
    z-index: 1;
    background-color: #fdfdfded;
    width: 20px;
    text-align: center;
    padding: 6px;
    border-radius: 20px;
    cursor: pointer;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(113,144,255,1);
}
</style>
<style>
.list-page .van-tabs__nav--card .van-tab{
    color: rgba(255,255,255,.5);
    background-color: #2B2421;
    border-right-color: #C79F6D;
    line-height: 40px;
}
.list-page .van-tabs__nav--card .van-tab.van-tab--active{
    color: #ffffff;
}
.list-page .van-tabs__nav--card{
   width: 200px;
   margin: 0 auto; 
   background:rgba(11,22,60,1);
   border-radius:4px;
   border:1px solid #C79F6D;
   font-size:15px;
    height: 40px;
    box-sizing: border-box;
}
.list-page .van-tabs--card>.van-tabs__wrap{
    height: 40px;
}
.list-page .van-tabs--card{
    padding-top: 60px;
}
</style>
