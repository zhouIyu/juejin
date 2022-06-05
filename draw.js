const axios = require('axios')
const info = require('./info')
const api = require('./api')

// 设置掘金cookie
axios.defaults.headers.Cookie = info.cookie

const drawOne = async () => {
  let { data } = await axios.post(api.drawApi)
  return data
}

const drawTen = async () => {
  let { data } = await axios.post(api.tenDrawApi)
  return data
}

const draw = (isTen = true, index = 0) => {
  isTen = isTen
  setTimeout(async () => {
    if (isTen) {
      const resTen = await drawTen()
      if (resTen.data) {
        console.log('十连抽成功:', ++index)
        draw(true, index)
      } else {
        draw(false, 0)
      }
    } else {
      const resOne = await drawOne()
      if (resOne.data) {
        console.log('单抽成功:', ++index)
        draw(false, index)
      } else {
        console.log('抽奖结束')
      }
    }

  }, 1000)
}

console.log('抽奖开始')
draw()
