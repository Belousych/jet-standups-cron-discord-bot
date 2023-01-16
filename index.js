const CronJob = require('cron').CronJob
const superagent = require('superagent');
const message = require('./message.json');
const { WEBHOOK_URL } = require('./src/config');
const { default: findRandomGifs } = require('./src/findRandomGifs');
const getYandexGif = require('./src/getYandexGif');

const sendMessage = async () => {
    const getGifUrl = await getYandexGif() || await findRandomGifs()
    const messageNext = { ...message }
    messageNext.content = `${message.content} \n\n[GIF](${getGifUrl})`
    const req = superagent.post(WEBHOOK_URL).send(messageNext)

    await req.then((res) => res.body).catch(error => console.log('EROROR', error))
}



// sendMessage()
new CronJob('45 20 * * 1-5', () => {
    sendMessage()
}, null,
    true, 'Asia/Yekaterinburg').start()