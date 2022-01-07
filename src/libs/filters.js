/**
 * 格式化时间
 *
 * @param {date} date
 * @param {string} format
 * @returns
 */
export function formatTime(date, format = 'yyyy-MM-dd hh:mm:ss') {
    if (!date) return ''
    if (typeof date === 'number') {
      if (Math.floor(date / 1e9) > 0 && Math.floor(date / 1e9) < 10) {
        date = date * 1000
      }
      date = new Date(date)
    } else if (typeof date === 'string') {
      // timestamp in secounds
      if (/^\d{10}$/.test(date)) {
        date = new Date(date * 1000)
      } else {
        // ios 中使用 new Date( yyyy-MM-dd hh:mm:ss:SS ) 时间格式字符串不能精确到 小时以后
        var dateArr = date.split(/[- :]/)
        var now = new Date()
        date = new Date(dateArr[0] || now.getFullYear(), dateArr[1] && parseInt(dateArr[1]) ? parseInt(dateArr[1]) - 1 : (now.getMonth() - 1), dateArr[2] || 1, dateArr[3] || 0, dateArr[4] || 0, dateArr[5] || 0)
      }
    } else {
      /* eslint-disable-next-line */
      console.error('wrong format', date)
      return ''
    }
  
    if (format === 'timestamp') return +date
  
    var map = {
      'M': date.getMonth() + 1, // 月份
      'd': date.getDate(), // 日
      'h': date.getHours(), // 小时
      'm': date.getMinutes(), // 分
      's': date.getSeconds(), // 秒
      'q': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds(), // 毫秒
      'W': '星期' + ['日', '一', '二', '三', '四', '五', '六'][date.getDay()] // 星期
    }
    format = format.replace(/([yMdhmsqSW])+/g, function (all, t) {
      var v = map[t]
      if (v !== undefined) {
        if (all.length > 1) {
          v = '0' + v
          v = v.substr(v.length - 2)
        }
        return v
      } else if (t === 'y') {
        return (date.getFullYear() + '').substr(4 - all.length)
      }
      return all
    })
    return format
  }
  
  /**
   * "yyyy-MM-dd hh:mm:ss"
   */
  export let fulltime = (date) => {
    return formatTime(date.getTime(), "yyyy-MM-dd hh:mm:ss")
  }

  export let moneyDesc = (n) => {
    if (!n) return ''
    n = '' + n
    if (n.split('.').length > 1) return ''
    const l = n.length
    const s = ['', '个', '十', '百', '千', '万', '十万', '百万', '千万', '亿', '十亿', '百亿']
    return s[l]
  }

export function formatCurrency (num) {
  return floorNum(num/1e8)
}

export function upper (str) {
  return str.toUpperCase()
}

export function filterHash (str) {
  return String(str).substr(0, 16) + '...' + String(str).substr(-4)
}

// 0 已取消
// 1 进行中
// 2 已完成
export function contractStatus (contract, blockTime) {
  if (contract.terminated) {
    return 0
  } else if (contract.means === 'LeftProportion') {
    return 1
  } else {
    const stopTime = Number(contract.startTime) + Number(contract.fixAmount.period) * (Math.ceil( contract.totalCount / contract.fixAmount.amount ) - 1)
    if ( stopTime > blockTime ) {
      return 1
    } else {
      return 2
    }
  }

}

export function unixTimeTransfer ( sec ) {
  if (sec <= 60) {
      return `${sec} 秒`
  } else if (sec <= 60*60) {
      return `${Math.floor(sec/60*10)/10} 分`
  } else if (sec <= 24*60*60) {
      return `${Math.floor(sec/60/60*10)/10} 时`
  } else {
      return `${Math.floor(sec/24/60/60*10)/10} 天`
  }
}

/**
 * 将大额数字转化为带单位的数字
 * 10000 -> 1万
 * 1000000 -> 100万
 * 10000000 -> 1千万
 * 100000000 -> 1亿
 * @export
 * @param {*} num
 */
export function numWithUnit (num) {
  let tmpNum = Math.ceil(num)
  if (tmpNum < 10000) {
    return num + ''
  } else if (tmpNum < 10000000) {
    return `${tmpNum/10000} 万`
  } else if (tmpNum < 100000000) {
    return `${tmpNum/10000000} 千万`
  } else {
    return `${tmpNum/100000000} 亿`
  }
}

// 仅计算 按数量解冻的情况
export function calcUnfreezeRecordList (data, blockTime) {
  const status = contractStatus(data, blockTime)
  // 冻结总数
  const totalCount = data.totalCount
  // 合约生效时间
  const startTime = data.startTime
  // 合约终止时间
  const terminateTime = data.terminateTime
  // 解冻周期
  const period = Number(data.fixAmount.period)
  // 每期解冻数量
  let amount = Number(data.fixAmount.amount)
  // 总解冻次数
  // 合约生效时立即解冻一次
  let times = 1

  if (status === 0) {
    // 已取消
    times = Math.floor((terminateTime - startTime ) / period) + 1
  } else if (status === 1) {
    // 进行中
    times = Math.floor((blockTime - startTime) / period) + 1
  } else {
    // 已完成
    times = Math.ceil(totalCount / amount)
  }

  let list = []

  let leftAmount = Number(totalCount)

  for (let i = 0; i < times ; i++) {
    if ( leftAmount > amount ) {
      leftAmount = leftAmount - amount
    } else {
      amount = leftAmount
      leftAmount = 0
    }
      
    list.push({
      t: startTime + period*i,
      n: numWithUnit(formatCurrency(amount)),
      a: '解冻',
    })
  }

  // console.log(times, leftAmount, list)

  return {
    times,
    alreadyUnfreeze: totalCount - leftAmount,
    unfreezeRecordList: list,
    hasMore: false, 
  } 

}

// 第n次解冻时应解冻的数额 x
function calcAvaOnTimes (n, totalCount, p) {
  return totalCount*Math.pow( 1 - p , n - 1)*p
}

function meansName (means) {
  return {
    "LeftProportion": "固定比例解锁",
    "FixAmount": "固定数量解锁",
  }[means]
}

function meansDesc (data) {
  if (data.means === "LeftProportion") {
    return `每期解锁剩余量的${unitForLP(data.leftProportion.tenThousandth)}`
  } else {
    return `每期解锁 ${numWithUnit(formatCurrency(data.fixAmount.amount))} ${data.assetSymbol}`
  }
}

function floorNum (num) {
  return Math.floor(num*10000)/10000
}

function unitForLP (v) {
  return Math.floor((v/100000)*100000)/1000 + '%'
}

export default {
    formatTime,
    fulltime,
    moneyDesc,
    formatCurrency,
    upper,
    filterHash,
    contractStatus,
    unixTimeTransfer,
    calcUnfreezeRecordList,
    meansName,
    meansDesc,
    floorNum,
    unitForLP,
    calcAvaOnTimes,
}