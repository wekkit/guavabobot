require('dotenv').config()
const Telegraf = require('telegraf')
const axios = require('axios')
const moment = require('moment')
const app = new Telegraf(process.env.BOT_TOKEN)
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Scene = require('telegraf/scenes/base')
const Stage = require('telegraf/stage')
const checkClassUrl = require('./puppeteer/checkClassUrl')
const db = require('./db')

// eslint-disable-next-line
const linkRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
const email = process.env.EMAIL
const password = process.env.PASSWORD

app.use((ctx, next) => {
  // if (ctx.chat.username !== 'wekkit') return next()
  const timestamp = moment().format('MMMM D, h:mm:ss a')
  if (ctx.message) {
    console.log(`[${timestamp}] ${ctx.chat.username}: ${ctx.message.text}`)
  }
  return next()
})

/**
 * SCENE-BASED INTERACTION
 */
const greeter = new Scene('greeter')
greeter.enter(ctx => ctx.reply('Hi'))
greeter.leave(ctx => ctx.reply('Bye'))
greeter.hears(/hi/gi, Stage.leave())
greeter.hears('lol', ctx => ctx.reply('lol'))
greeter.on('message', ctx => ctx.reply('Send `hi`'))

const stage = new Stage()
stage.register(greeter)
app.use(stage.middleware())
app.command('greeter', ctx => ctx.scene.enter('greeter'))

/**
 * API CALL RESPONSE
 */
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

/**
 * RANDOM DB STUFF
 */
app.hears('hello', ctx => {
  const response = `hello, ${ctx.chat.username}!`
  return ctx.replyWithMarkdown(`\`${response}\``)
})

app.hears('get', ctx => {
  db.get(ctx.chat.username).then(doc =>
    ctx.replyWithMarkdown(`\`${doc._id}: ${doc.count}\``)
  )
})

app.hears('register', ctx => {
  const doc = { _id: ctx.chat.username, count: 0, chatId: ctx.chat.id }
  const response = `registered, ${doc._id}`
  db.put(doc)
    .then(() => ctx.replyWithMarkdown(`\`${response}\``))
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
    .then(() => {
      ctx.replyWithMarkdown('`database cleared`')
    })
})

/**
 * ANNOYING INTERVAL
 */
let check
app.hears('start', ctx => {
  check = setInterval(() => {
    ctx.replyWithMarkdown('`lol`')
  }, 5000)
})
app.hears('stop', ctx => {
  clearInterval(check)
})

/**
 * CHECK GUAVA
 */
app.hears(linkRegex, async ctx => {
  ctx.replyWithMarkdown('`ooo, a link! let me check...`')
  const result = await checkClassUrl(email, password, ctx.message.text)
  if (!result.status) return ctx.replyWithMarkdown('`nope`')
  if (result.error) return ctx.replyWithMarkdown('`error`')
  return ctx.replyWithMarkdown(`\`${result.message}\``)
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
