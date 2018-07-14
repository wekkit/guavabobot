const puppeteer = require('puppeteer')

const checkClasses = async (email, password, checkMap) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  try {
    await page.goto('https://guavapass.com')
    console.log('navigating to guavapass website.')
    await page.click('.gp-button--secondary.gp-button--small')
    await page.waitFor(3000)
    await page.type('#user_email', email)
    await page.type('#user_password', password)
    await page.click('input.gp-button--green.gp-button--block')
    console.log(`logging in as ${email}.\n`)
    await page.waitFor(1000)
    for (let studio in checkMap) {
      console.log(`checking for ${studio}...`)
      await page.goto(`http://guavapass.com/singapore/${studio}`)
      await page.waitFor(5000)
      for (let i in checkMap[studio]) {
        const classId = checkMap[studio][i]
        const className = await page.$eval(
          `tr[data-id="${classId}"] a.class-link`,
          el => el.textContent
        )
        const classTime = await page.$eval(
          `tr[data-id="${classId}"] td.info-time`,
          el => el.textContent
        )
        const free = await page.$(
          `tr[data-id="${classId}"] a.booking-btn.gp-button--primary`
        )
        let status
        if (free) status = 'FREE'
        else if (free === null) status = 'FULL'
        console.log(`- ${className} @${classTime} at ${studio} is ${status}`)
      }
      console.log('')
    }
  } catch (e) {
    console.warn(e)
    console.log('there was an error. taking screenshot...')
    await page.screenshot({ path: 'errorshot.png' })
    await browser.close()
  }
  await browser.close()
}

module.exports = checkClasses
