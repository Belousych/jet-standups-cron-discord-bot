const CronJob = require('cron').CronJob
const superagent = require('superagent');
const message = require('./message.json');
const { WEBHOOK_URL } = require('./src/config');
const findRandomGifs = require('./src/findRandomGifs');
const getYandexGif = require('./src/getYandexGif');
const { declOfNum } = require('./src/utils');

const sendMessage = async () => {
    const yandexResponse = await getYandexGif()
    const gifUrl = yandexResponse?.url || await findRandomGifs()
    const messageNext = { ...message }
    messageNext.content = `${message.content} \n\n[GIF](${gifUrl})`
    const total = yandexResponse?.total
    if (yandexResponse && total >= 0 && total <= 3) {
        messageNext.content += `\n\n**${'🔥'.repeat(4 - total)} в папке осталось  ${total} ${declOfNum(total, ['картинка', 'картинки', 'картинок'])}.** ${total > 0 ? 'Когда они кончатся я буду искать сам' : ''}`
    }
    const req = superagent.post(WEBHOOK_URL).send(messageNext)

    await req.then((res) => res.body).catch(error => console.log('EROROR', error))
}



// sendMessage()
new CronJob('27 10 * * 1-5', () => {
    sendMessage()
}, null,
    true, 'Asia/Yekaterinburg').start()