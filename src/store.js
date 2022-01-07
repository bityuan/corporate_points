import Vue from 'vue'
import Vuex from 'vuex'
import Chain33 from '@33cn/chain33-rpc-api'

import storageList, {PAY_RECORD} from '@/libs/storageList.js'
// import {Notify} from 'vant'
import chain33errori18n from '@33cn/chain33errori18n'
import app_config from '../corporate_points.config'
Vue.use(Vuex)

const resHandler = ({ error = '' , result = {}}) => {
  if (error) {
    error = chain33errori18n(error, 'zh')
    if (error === 'tx not exist') {
      error = '交易不存在'
    }
    return Promise.reject(new Error(error))
  }
  return result
}


const STORAGE_NS = 'namespace@freeze'
const STORAGE_PR = 'provider@freeze'
const STORAGE_AD = 'address@freeze'

const defaultProvider = app_config.url
const defaultNamespace = app_config.namespace


let chain33 = new Chain33(defaultProvider, resHandler)

const emptyAccount = {
  currency: 0,
  balance: 0,
  frozen: 0,
}

function completeContractData (list) {
  let task = []
  list = list.map((item) => {

    const txhash = item.unfreezeID.substring(14)
    const fullTxHash = `0x${txhash}`
    const dataInLocal = storageList.data[PAY_RECORD] && storageList.data[PAY_RECORD].find(item => /createUnfreeze/.test(item.a) && item.h === fullTxHash)

    // console.log('find data in local!', dataInLocal)

    item.txhash = fullTxHash

    if (dataInLocal) {
      item.contractName = dataInLocal.a.split('-')[1]
    }

    task.push(chain33.searchTreatyWithdraw(txhash))
    return item
  })
  return Promise.all(task).then( avalist => {
    avalist.forEach( ({availableAmount}, i) => {
      list[i].availableAmount = availableAmount
    })
    return list
  })
}

export {
  chain33,
}

export default new Vuex.Store({
  state: {
    sendUrl: app_config.sendtoUrl_pre,
    hasCheckedConfig: !!(defaultNamespace && defaultProvider),
    namespace: defaultNamespace,
    provider: defaultProvider,
    contractAddress: '',
    address: '',
    balance: [],
    loadingBalance: false,
    showDebug: false,
    createByMeListdata: [],
    mineListdata: [],
    loadingCreateByme: false,
    loadingMine: false,
    blockTime: +new Date(),
  },
  getters: {
    execName (state) {
      return `${state.namespace}unfreeze`
    },
    execer (state) {
      return `${state.namespace}coins`
    },
    providerName (state) {
      const c = app_config.url
      return c
    },
    isParallel (state) {
      const c = app_config.isParalle
      return c
    },
    coinSymbol (state) {
        const a =  app_config.assetsOption.find(item => item.assetExec === 'coins')
        return a ? a.assetSymbol : ''
    },
    unfreezeBalance (state) {
      const b = state.balance.find(item => item.execer === `${state.namespace}unfreeze`)
      if (b) {
        return b.account || emptyAccount
      } else {
        return emptyAccount
      }
    },
    coinsBalance (state) {
      const b = state.balance.find(item => item.execer === `${state.namespace}coins`)
      if (b) {
        return b.account || emptyAccount
      } else {
        return emptyAccount
      }
    },
  },
  mutations: {
    updateNamespace(state, namespace) {
      state.namespace = namespace
      localStorage.setItem(STORAGE_NS, namespace)
    },
    updateAddress(state, address) {
      state.address = address
      localStorage.setItem(STORAGE_AD, address)
    },
    toggleShowDebug(state) {
      state.showDebug = !this.showDebug
    },
    updateContractAddress(state, address) {
      state.contractAddress = address
    },
    updateLoadingBalance (state, status) {
      state.loadingBalance = status
    },
    updateBalance (state, arr) {
      state.balance = arr
    },
    updateProvider(state, provider) {
      state.provider = provider
      localStorage.setItem(STORAGE_PR, provider)
      chain33 = new Chain33(provider, resHandler)
    },
    checkedConfig(state) {
      state.hasCheckedConfig = true
    },
    resetConfig(state) {
      localStorage.removeItem(STORAGE_NS)
      localStorage.removeItem(STORAGE_PR)
      localStorage.removeItem(STORAGE_AD)
      state.hasCheckedConfig = false
      state.namespace = ''
      state.provider = ''
      state.address = ''
    },
    updateLoadingCreateByme (state, status) {
      state.loadingCreateByme = status
    },
    updateCreateByMeListdata (state, list) {
      state.createByMeListdata = list
    },
    updateLoadingMine (state, status) {
      state.loadingMine = status
    },
    updateMineListdata (state, list) {
      state.mineListdata = list
    },
    updateBlockTime (state, timestamp) {
      state.blockTime = timestamp
    },
  },
  actions: {
    getContractAddress ({state, commit}) {
      chain33.convertExectoAddr(`${state.namespace}unfreeze`).then((address) => {
        console.log('getContractAddress', address)
        commit('updateContractAddress', address)
      })
    },
    getBalance ({state, commit}) {
      commit('updateLoadingBalance', true)
      chain33.getAllExecBalance(state.address).then(result => {
        commit('updateLoadingBalance', false)
        commit('updateBalance', result.execAccount || [])
      })
    },
    listUnfreezeByCreator ({state, commit}) {
      commit('updateLoadingCreateByme', true)
      chain33.listUnfreezeByCreator(state.address).then((result) => {
        return completeContractData(result.unfreeze)
      }).then(list => {
        // 隐藏按比例解冻
        list = list.filter(item => item.means==='FixAmount')
                    .map(item => {
                      item.availableAmount = Number(item.availableAmount)
                      item.startTime = Number(item.startTime)
                      item.remaining = Number(item.remaining)
                      item.terminateTime = Number(item.terminateTime)
                      item.totalCount = Number(item.totalCount)
                      return item
                    })
        commit('updateCreateByMeListdata', list)
        commit('updateLoadingCreateByme', false)
      }).catch(e => {
        if (e.message === "未找到") {
          commit('updateCreateByMeListdata', [])
          commit('updateLoadingCreateByme', false)
        } else {
          console.error(e)
        }
      })
    },
    listUnfreezeByBeneficiary ({state, commit}) {
      commit('updateLoadingMine', true)
      chain33.listUnfreezeByBeneficiary(state.address).then((result) => {
        // load Avalible amount
        return completeContractData(result.unfreeze)
      }).then(list => {
        list = list.filter(item => item.means==='FixAmount')
                    .map(item => {
                      item.availableAmount = Number(item.availableAmount)
                      item.startTime = Number(item.startTime)
                      item.remaining = Number(item.remaining)
                      item.terminateTime = Number(item.terminateTime)
                      item.totalCount = Number(item.totalCount)
                      return item
                    })
        commit('updateMineListdata', list)
        commit('updateLoadingMine', false)
      }).catch(e => {
        if (e.message === "未找到") {
          commit('updateMineListdata', [])
          commit('updateLoadingMine', false)
        } else {
          console.error(e)
        }
      })
    },
    getBlockTime ({commit}) {
      chain33.getLastHeader().then((result) =>{
        commit('updateBlockTime', result.blockTime)
      })
    }
  },
});
