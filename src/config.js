const { get_random } = require("./utils")

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


const gifs = {
    "tea": gifTea,
    "coffee": gifCoffee,
    "cider": gifCider,
    "vodka": gifVodka
}

const gifsName = {
    "tea": "чай",
    "coffee": "кофе",
    "cider": "сидр",
    "vodka": "водка"
}

const getDrinkGif = () => {
    const arrTea = Array(12).fill("tea")
    const arrCoffee = Array(7).fill("coffee")
    const arrVodka = Array(2).fill("vodka")
    const arrCider = Array(4).fill("cider")

    const arr = [...arrTea, ...arrCoffee, ...arrVodka, ...arrCider]

    const item = get_random(arr) || "tea"

    return {
        gifs: gifs[item],
        name: gifsName[item]
    }
}




module.exports = { WEBHOOK_URL, GIF_URL, YANDEX_PUBLIC_FOLDER, gifQ, getDrinkGif }