const Telegraf = require('telegraf')
const axios = require('axios')
require('dotenv').config()
const app = new Telegraf(process.env.BOT_TOKEN)
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
// const checkClasses = require('./puppeteer/checkClassMap')
const checkClassUrl = require('./puppeteer/checkClassUrl')
const linkRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/

const email = process.env.EMAIL
const password = process.env.PASSWORD

app.context.db = (() => {
  let value = 0
  return {
    get: () => value,
    add: val => {
      value += val
    }
  }
})()

app.hears('yesno', ctx => {
  axios
    .get('https://yesno.wtf/api')
    .then(res => {
      const response = `bobot says ${res.data.answer}`
      return ctx.replyWithMarkdown(`\`${response}\``)
    })
    .catch(console.log)
})

app.hears('get', ctx => {
  return ctx.replyWithMarkdown(`\`${ctx.db.get()}\``)
})

app.hears('add', ctx => {
  ctx.db.add(1)
  return ctx.replyWithMarkdown('`added 1`')
})

app.hears(linkRegex, async ctx => {
  ctx.replyWithMarkdown('`ooo, a link! let me check...`')
  const response = await checkClassUrl(email, password, ctx.message.text)
  return ctx.replyWithMarkdown(`\`${response}\``)
})

app.hears(/./g, ctx => {
  const response = 'guava guava'
  return ctx.replyWithMarkdown(
    `\`${response}\``,
    Extra.markup(Markup.keyboard(['guava guava?']))
  )
})

console.log('GUAVA GUAVA!')
app.startPolling()
