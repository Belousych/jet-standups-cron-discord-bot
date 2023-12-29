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
    "работ",
    "мотивация",
    "do it",
    "эй"
]


const gifTea = ["tea", "tea time", "чай", "пью чай", "пить чай", "безумное чаепитие", "чаепитие"]
const gifCoffee = ["coffee", "coffee time", "кофе", "пью кофе", "пить кофе", "кофе брейк"]
const gifCider = ["cider", "сидр", "пью сидр", "пить сидр"]
const gifVodka = ["vodka", "водка", "пью водку", "пить водку"]



module.exports = { WEBHOOK_URL, GIF_URL, YANDEX_PUBLIC_FOLDER, gifQ }