const axios = require('axios')
const nodeMailer = require('nodemailer')
const schedule = require('node-schedule')

const { info, api } = require('./config')

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
    if (drawData) {
      subject += ',抽奖成功'
      content += `掘金免费抽奖成功, 获得：${drawData.data.lottery_name}`
    } else {
      subject += ',抽奖失败'
      content += `掘金免费抽奖失败, 获得：${drawData.err_msg}`
    }
  } else {
    subject = checkInData.err_msg
    content = checkInData.err_msg
  }

  sendEmail(subject, content)
}

const start = () => {
  schedule.scheduleJob('00 00 10 * * *', async () => {
    await signIn()
  })
}

start()




