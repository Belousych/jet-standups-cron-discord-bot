const CronJob = require('cron').CronJob
const superagent = require('superagent');
const message = require('./message.json');
const calendar = require('./superjob2023.json');
const { WEBHOOK_URL } = require('./src/config');
const findRandomGifs = require('./src/findRandomGifs');
const getYandexGif = require('./src/getYandexGif');
const { declOfNum } = require('./src/utils');

const sendMessage = async () => {
    let today = new Date().toISOString().slice(0, 10);
    if (calendar && calendar?.holidays && calendar?.holidays.includes(today)) {
        return 
    }


    const yandexResponse = await getYandexGif()
    const gifUrl = yandexResponse?.url || await findRandomGifs()

    const file  = await superagent.get(gifUrl).responseType('blob').then(res => res.body)
    const messageNext = { ...message }
    messageNext.content = `${message.content} \n\n[GIF](${gifUrl})`
    const total = yandexResponse?.total
    if (yandexResponse && total >= 0 && total <= 3) {
        messageNext.content += `\n\n**${'🔥'.repeat(4 - total)} в папке осталось  ${total} ${declOfNum(total, ['картинка', 'картинки', 'картинок'])}.** ${total > 0 ? 'Когда они кончатся я буду искать сам' : ''}`
    }
    const req = superagent.post(WEBHOOK_URL).field("payload_json", JSON.stringify(messageNext)).attach('image1', file)

    await req.then((res) => res.body).catch(error => error)
}



// sendMessage()
new CronJob('30 9 * * 1-5', () => {
    sendMessage()
}, null,
    true, 'Asia/Yekaterinburg').start()




