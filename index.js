const Telegraf = require('telegraf')
require('dotenv').config()
const app = new Telegraf(process.env.BOT_TOKEN)

app.hears('hello', ctx => {
  return ctx.reply('GUAVA GUAVA!')
})

app.startPolling()
