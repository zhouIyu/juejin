const axios = require('axios')
const nodeMailer = require('nodemailer')
const schedule = require('node-schedule')

const info = require('./info')
const api = require('./api')
// 设置掘金cookie
axios.defaults.headers.Cookie = info.cookie

// 签到
const checkIn = async () => {
  let { data } = await axios.post(api.checkInApi)
  return data
}

// 抽奖
const draw = async () => {
  let { data } = await axios.post(api.drawApi)
  return data
}

// 沾福
const lucky = async () => {
  let { data: luckyData } = await axios.post(api.luckyListApi, {
    page_no: 1,
    page_size: 5
  })
  console.log(luckyData)
  const id = luckyData.data.lotteries[0].history_id
  let { data } = await axios.post(api.luckyApi, {
    lottery_history_id: id
  })
  console.log(data)
  return data
}

const sendEmail = (subject, html) => {
  const { user, from, to, pass } = info
  const transporter = nodeMailer.createTransport({ service: 'qq', auth: { user, pass } })
  transporter.sendMail({ from, to, subject, html }, (err) => {
    if (err) {
      return console.log(`邮件发送失败，${err}`)
    }
    console.log('邮件发送成功')
  })
}

const signIn = async () => {
  const checkInData = await checkIn()
  let subject, content
  console.log('🔥', checkInData)
  if (checkInData.data) {
    subject = '掘金签到'
    content = `掘金签到成功！今日获得${checkInData.data.incr_point}积分，当前总积分：${checkInData.data.sum_point}。`
    const drawData = await draw()
    console.log('💰', drawData)
    if (drawData.data) {
      subject += ',抽奖成功'
      content += `掘金免费抽奖成功, 获得：${drawData.data.lottery_name}`
    } else {
      subject += ',抽奖失败'
      content += `掘金免费抽奖失败, 获得：${drawData.err_msg}`
    }
    const luckyData = await lucky()
    console.log('❤', luckyData)
    if (luckyData.data) {
      content += `,沾福成功，获得：${luckyData.data.dip_value}`
    }
    console.log(subject)
    console.log(content)
    console.log('-----------------------')
  } else {
    subject = checkInData.err_msg
    content = checkInData.err_msg
    sendEmail(subject, content)
  }
}

const start = () => {
  schedule.scheduleJob('00 00 08 * * *', async () => {
    await signIn()
  })
}

start()


module.exports = { signIn }


