import {chain33} from '@/store.js'
export default {
    methods: {
        pollingForResult(txhash) {
          return new Promise(resolve => {
            let queryTransaction = () => {
                return chain33.queryTransaction(txhash).then(res => {
                    // 查交易组中非none的一条交易
                    if ( res.tx.groupCount > 1 && /none$/.test(res.tx.execer) && res.tx.next ) {
                        txhash = res.tx.next
                        setTimeout(() => {
                            queryTransaction()
                        }, 300)
                    } else if (res.receipt.ty >= 2) {
                        // success
                        resolve(txhash)
                    } else {
                        resolve(false)
                    }
                }).catch(e => {
                    // do again
                    console.log(e.message)
                    setTimeout(() => {
                        queryTransaction()
                    }, 300);
                })
            }
            
            setTimeout(() => {
                queryTransaction()
            }, 300);
            
          })  
        },
    },
}