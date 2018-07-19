const puppeteer = require('puppeteer')
require('dotenv').config()

const checkClassUrl = async (email, password, url) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  try {
    await page.goto('https://guavapass.com/users/login')
    await page.click('#user_email')
    await page.type('#user_email', email)
    await page.type('#user_password', password)
    await page.click('input.gp-button--green.gp-button--block')
    await page.waitFor(1000)
    await page.goto(url)
    const className = await page.$eval('#lesson-show h1', el => el.textContent)
    const classTime = await page.$eval(
      '#lesson-show .time',
      el => el.textContent
    )
    const classDate = await page.$eval(
      '#lesson-show .date',
      el => el.textContent
    )
    const bookLink = await page.$eval('.book a', el => el.getAttribute('href'))
    await browser.close()
    const status = bookLink !== '#' ? 'AVAILABLE' : 'NOT AVAILABLE'
    return `${className.toLowerCase()} on ${classDate.toLowerCase()} ${classTime.toLowerCase()} is ${status}!`
  } catch (e) {
    console.warn(e)
    console.log('error. taking screenshot...')
    await page.screenshot({ path: '../screenshots/errorshot.png' })
    await browser.close()
    return 'oops! there was an error.'
  }
}

module.exports = checkClassUrl
