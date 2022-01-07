export function urlQuery(e, url) {
    if (!url) {
        url = window.location.search
    }
    const t = url.match(new RegExp('(\\?|&)' + e + '=([^&]*)(&|$)'))
    return t ? decodeURIComponent(t[2]) : ''
}

export function moneyDesc(n) {
    const l = n.length
    const s = ['', '个', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿']
    return s[l]
}
