const WEBHOOK_URL = 'https://discord.com/api/v10/webhooks/1062724141830115388/QTICPjHqr9ygEXAlARNpTHO34Ivi3WvXHI1s6-DjUcPXoC9YhGZTvhlYUTdOXJAXkWYe?wait=true'

const GIF_URL = "https://discord.com/api/v9/gifs/search" //q=%D1%81%D1%82%D0%B5%D0%BD%D0%B4%D0%B0%D0%BF%2B%D1%82%D1%80%D1%83%D0%B1%D0%B0%D1%87&media_format=mp4&provider=tenor&locale=ru

// const YANDEX_OAUTH_TOKEN = 'y0_AgAAAAAHW-CIAADLWwAAAADZl8FGy8UKDpf6QYuDsfIcow7qcr_ifug'

const YANDEX_PUBLIC_FOLDER = 'https://disk.yandex.ru/d/3cAN4ZQO-bCXSA'

const CronJob = require('cron').CronJob
const superagent = require('superagent');
const message = require('./message.json');


const gifQ = [
    "go to work",
    "за компом",
    "list",
    "wake up",
    "coding",
    "пошли",
    "let's go",
    "стендап",
    "бегу",
    "бежим",
    "митинг",
    "meet",
    "пишу",
    "team",
    "команда",
    "пожалуйста",
    "работа",
    "работ"
]


let used_id = []

function get_random(list) {
    return list[Math.floor((Math.random() * list.length))];
}

const findRandomGifs = async () => {
    let delay = 0; const delayIncrement = 250;
    let mergedArray = []



    const promises = gifQ.map((q) => {
        delay += delayIncrement;
        return new Promise(resolve => setTimeout(resolve, delay)).then(() => {
            return superagent.get(`${GIF_URL}?q=${encodeURIComponent(q)}&media_format=mp4&provider=tenor&locale=ru`).retry(5).then(res => {
                // console.log({ q })
                mergedArray = [...mergedArray, ...res.body]
            }).catch((error) => {
                console.log('ERORR', {
                    q,
                    error: error.text
                })
                return []
            })
        })

    })

    return await Promise.all(promises).then(() => {


        const mergedArrayWithoutRepeat = [...new Set([...mergedArray])]

        // console.log('SUCCESS GET GIFS', mergedArray.length)
        // console.log('SUCCESS GET GIFS', mergedArrayWithoutRepeat.length)

        const item = get_random(mergedArrayWithoutRepeat)

        return item.url
    }).catch(error => {
        console.error(error)

        return null
    })

}


const getYandexGif = async () => {
    const folder = await superagent.get(`https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURI(YANDEX_PUBLIC_FOLDER)}`).then(res => res.body)


    if (folder?._embedded) {
        const items = folder?._embedded?.items || []

        const itemsFiltered = items.filter(i => !used_id.includes(i.resource_id) && i.size < 8388608)
        const randomItem = get_random(itemsFiltered)



        if (randomItem) {
            if (process.env.YANDEX_OAUTH_TOKEN) {
                // await superagent
                //     .delete(encodeURI(`https://cloud-api.yandex.net/v1/disk/resources?path=/${folder.name}${randomItem.path}`))
                //     .set('Authorization', `OAuth ${process.env.YANDEX_OAUTH_TOKEN}`)
                //     .then(res => res.body)
                //     .catch(error => console.error(error))
                used_id.push(randomItem.resource_id)
            } else {
                used_id.push(randomItem.resource_id)
            }



            return randomItem.file
        } else {
            return null
        }


    }


}

const sendMessage = async () => {
    const getGifUrl = await getYandexGif() || await findRandomGifs()

    const messageNext = { ...message }

    messageNext.content = `[GIF](${getGifUrl}) \n\n ${message.content}`





    const req = superagent.post(WEBHOOK_URL).send(messageNext)
    // for (var key in message) {
    //     req.field(key, message[key]);
    // }
    const res = await req.then((res, req) => {

    }).catch(error => console.log('EROROR', error))



}



// sendMessage()
new CronJob('30 18 * * 1-5', () => {
    sendMessage()
}, null,
    true, 'Asia/Yekaterinburg').start()