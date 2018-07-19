const Telegraf = require('telegraf')
const axios = require('axios')
const moment = require('moment')
require('dotenv').config()
const app = new Telegraf(process.env.BOT_TOKEN)
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const checkClassUrl = require('./puppeteer/checkClassUrl')
const db = require('./db')

// eslint-disable-next-line
const linkRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
const email = process.env.EMAIL
const password = process.env.PASSWORD

app.use((ctx, next) => {
  // if (ctx.chat.username !== 'wekkit') return next()
  const timestamp = moment().format('MMMM D, h:mm:ss a')
  console.log(`[${timestamp}] ${ctx.chat.username}: ${ctx.message.text}`)
  return next()
})

// app.hears('db', ctx => {})

app.hears('hello', ctx => {
  const response = `hello, ${ctx.chat.username}!`
  return ctx.replyWithMarkdown(`\`${response}\``)
})

app.hears('yesno', ctx => {
  axios
    .get('https://yesno.wtf/api')
    .then(res => {
      const response = `bobot says ${res.data.answer}`
      return ctx
        .replyWithVideo(res.data.image)
        .then(() => ctx.replyWithMarkdown(`\`${response}\``))
    })
    .catch(console.error)
})

app.hears('get', ctx => {
  db.get(ctx.chat.username).then(doc =>
    ctx.replyWithMarkdown(`\`${doc._id}: ${doc.count}\``)
  )
})

app.hears('add', ctx => {
  db.get(ctx.chat.username).then(doc => {
    doc.count++
    db.put(doc).then(() =>
      ctx.replyWithMarkdown(`\`${doc._id}: ${doc.count}\``)
    )
  })
})

app.hears('put', ctx => {
  const doc = {
    _id: ctx.chat.username,
    count: 0
  }
  db.put(doc)
    .then(() => ctx.replyWithMarkdown('`put`'))
    .catch(console.log)
})

app.hears('clear', ctx => {
  db.allDocs({ include_docs: true })
    .then(allDocs =>
      allDocs.rows.map(row => ({
        _id: row.id,
        _rev: row.doc._rev,
        _deleted: true
      }))
    )
    .then(deleteDocs => db.bulkDocs(deleteDocs))
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
