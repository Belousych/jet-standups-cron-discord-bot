const { get_random } = require("./utils");

const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  "https://discord.com/api/v10/webhooks/1062724141830115388/QTICPjHqr9ygEXAlARNpTHO34Ivi3WvXHI1s6-DjUcPXoC9YhGZTvhlYUTdOXJAXkWYe?wait=true";
const GIF_URL = "https://discord.com/api/v9/gifs/search";
const YANDEX_PUBLIC_FOLDER =
  process.env.YANDEX_PUBLIC_FOLDER || "https://disk.yandex.ru/d/3cAN4ZQO-bCXSA";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
  "эй",
];

const gifTea = [
  "tea",
  "tea time",
  "чай",
  "чаепитие",
];
const gifCoffee = [
  "coffee",
  "coffee time",
  "кофе",
  "кофе брейк",
  "coffe break",
];
const gifCider = ["cider"];
const gifVodka = ["vodka", "водка", "пью водку", "пить водку"];
const gifBeer = ["pivo", "пиво", "пью пиво", "пить пиво"];

const gifs = {
  tea: gifTea,
  coffee: gifCoffee,
  cider: gifCider,
  vodka: gifVodka,
  beer: gifBeer,
};

const gifsName = {
  tea: "чай",
  coffee: "кофе",
  cider: "сидр",
  vodka: "водка",
  beer: 'пиво',
};

const getDrinkGif = () => {
  const arrTea = Array(15).fill("tea");
  const arrCoffee = Array(7).fill("coffee");
  const arrVodka = Array(2).fill("vodka");
  const arrCider = Array(4).fill("cider");
  const arrBeer = Array(3).fill("beer");

  const arr = [...arrTea, ...arrCoffee, ...arrVodka, ...arrCider, ...arrBeer];

  const item = get_random(arr) || "tea";

  return {
    gifs: gifs[item],
    name: gifsName[item],
  };
};

module.exports = {
  WEBHOOK_URL,
  GIF_URL,
  YANDEX_PUBLIC_FOLDER,
  gifQ,
  getDrinkGif,
  TELEGRAM_TOKEN,
  TELEGRAM_CHAT_ID,
};
