const apiPrefix = 'https://b.biqianbao.net/interface/lock/search'

export default {
    methods: {
        queryRecords (action_type, beneficiary) {
            const url = `${apiPrefix}?action_type=${action_type}&beneficiary=${beneficiary}`
            return fetch(url).then(res => res.json())
        }
    },
}