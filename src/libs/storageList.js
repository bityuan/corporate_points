// 本地存储列表数据
class iStorageList {
    constructor(keys = []) {

        this.data = {}
        keys.map( key => {
            let res = localStorage.getItem(key)
            try {
                res = JSON.parse(res)
            } catch (error) {
                res = []
            }
            this.data[key] = res || []
        })
    }

    // storage in ram
    data = {}

    push (key, content = {}) {
        console.log('push')
        if (this.data[key]) {
            this.data[key].push(content)
        } else {
            this.data[key] = [content]
        }
        this.save(key)
    }

    contact (key, list = []) {
        if (this.data[key]) {
            this.data[key] = [...this.data[key], ...list]
        } else {
            this.data[key] = list            
        }
        this.save(key)
    }

    save (key) {
        localStorage.setItem(key, JSON.stringify(this.data[key]))
    }

    deleteOne (key, index) {
        this.data[key].splice(index, 1)
        this.save(key)
    }

}

export const PAY_RECORD = 'payrecord@unfreeze'
export function createRecord (hashid, action, time) {
    return {
        h: hashid,
        a: action,
        t: time || +new Date()
    }
}

const storageList = new iStorageList([
    PAY_RECORD
])

// 存储交易记录
export default storageList 