const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://discord.com/api/v10/webhooks/1062724141830115388/QTICPjHqr9ygEXAlARNpTHO34Ivi3WvXHI1s6-DjUcPXoC9YhGZTvhlYUTdOXJAXkWYe?wait=true'
const GIF_URL = "https://discord.com/api/v9/gifs/search"
const YANDEX_PUBLIC_FOLDER = process.env.YANDEX_PUBLIC_FOLDER || 'https://disk.yandex.ru/d/3cAN4ZQO-bCXSA'

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

module.exports = { WEBHOOK_URL, GIF_URL, YANDEX_PUBLIC_FOLDER, gifQ }