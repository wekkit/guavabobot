const Telegraf = require('telegraf')
require('dotenv').config()
const app = new Telegraf(process.env.BOT_TOKEN)
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

app.hears(/./g, ctx => {
  return ctx.replyWithMarkdown('`GUAVA GUAVA`', Extra.markup(Markup.keyboard(['Guava guava?'])))
})

app.startPolling()
