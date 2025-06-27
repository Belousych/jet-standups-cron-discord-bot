require('dotenv').config(); // Это должно быть первой строкой
const CronJob = require('cron').CronJob;
const superagent = require('superagent');
const message = require('./message.json');
const calendar = require('./consultant2025.json'); //https://github.com/d10xa/holidays-calendar?tab=readme-ov-file
const {
  gifQ,
  TELEGRAM_TOKEN,
  TELEGRAM_CHAT_ID,
  getDrinkGif,
} = require('./src/config');
const { findRandomGifs, getRandomGif } = require('./src/findRandomGifs');
const getYandexGif = require('./src/getYandexGif');
const { declOfNum, get_random } = require('./src/utils');

// Telegram API URL
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendAnimation`;
const TELEGRAM_API_URL_PICTURE = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
const TELEGRAM_API_URL_TEXT = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

const message_thread_id = 48; // standups thread id
const message_thread_id_work_log = 40; // work log thread id

const PINNED_MESSAGES_LIMIT = 7; // Максимальное количество закрепленных сообщений

let pinnedMessageIds = []; // Хранилище закрепленных сообщений бота

const unpinBotMessages = async () => {
  try {
    // Проверяем, нужно ли удалять закрепления
    if (pinnedMessageIds.length <= PINNED_MESSAGES_LIMIT) return;
    // Получаем список сообщений для удаления, оставляя последние 5
    const messagesToUnpin = pinnedMessageIds.slice(0, -5);
    // Убираем закрепление только своих сообщений
    for (const messageId of messagesToUnpin) {
      await superagent
        .post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/unpinChatMessage`)
        .send({
          chat_id: TELEGRAM_CHAT_ID,
          message_id: messageId,
        })
        .catch((error) => console.error('Error unpinning message:', error));
    }

    // Очищаем список после открепления
    pinnedMessageIds = [];
  } catch (error) {
    console.error('Error unpinning bot messages:', error);
  }
};

const sendMessage = async () => {
  // Убираем закрепление своих сообщений
  await unpinBotMessages();
  let today = new Date().toISOString().slice(0, 10);
  if (calendar && calendar?.holidays && calendar?.holidays.includes(today)) {
    return;
  }

  const yandexResponse = await getYandexGif();

  console.log({ yandexResponse });
  const query = get_random(gifQ);

  let apiUrl = TELEGRAM_API_URL;
  let mediaField = 'animation';
  if (yandexResponse?.mime_type) {
    if (
      yandexResponse?.mime_type === 'image/png' ||
      yandexResponse?.mime_type === 'image/jpeg'
    ) {
      apiUrl = TELEGRAM_API_URL_PICTURE;
      mediaField = 'photo';
    }
  }

  const gifUrl = yandexResponse?.url || (await getRandomGif(query));

  let messageNext = { ...message };
  messageNext.content = `${message.content}`;

  const total = yandexResponse?.total;
  if (yandexResponse && total >= 0 && total <= 3) {
    messageNext.content += `\n\n**${'🔥'.repeat(
      4 - total
    )} в папке осталось  ${total} ${declOfNum(total, [
      'картинка',
      'картинки',
      'картинок',
    ])}.** ${total > 0 ? 'Когда они кончатся я буду искать сам' : ''}`;
  }
  try {
    // Отправка сообщения в Telegram через superagent
    const res = await superagent
      .post(apiUrl)
      .send({
        chat_id: TELEGRAM_CHAT_ID,
        [mediaField]: gifUrl,
        message_thread_id: message_thread_id,
        caption: `**Доброе утро, @everyone !!!**

До 11:00 ЕКБ оставьте в чате сообщение, которое отвечает на **три вопроса**:

1. **Кто мы?** (кто пишет)
2. **Откуда мы?** (В каком проекте)
3. **Куда мы идем?** (Что собирается сделать. Желательно подумать или описать желаемый достижимый результат)

Если у вас есть событие или требуется помощь или синхронизация — написать про это тоже. Поменьшить людей, с которыми будет нужно синхронизироваться.

---

### Прочее
- Задавать вопросы и уточнять у других — **очень хорошо!**
- Ставить лайки, делать суб-обсуждения и т.п. — **очень хорошо!**
- Постить гифки и стикеры — в меру — **хорошо!**
`,
        parse_mode: 'Markdown',
      })
      // .then(res => console.log('Message sent:', res.body))
      .catch((error) => console.error('Error sending message:', error));

    // Закрепление отправленного сообщения
    if (res.body && res.body.result && res.body.result.message_id) {
      const messageId = res.body.result.message_id;
      pinnedMessageIds.push(messageId);

      await superagent
        .post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/pinChatMessage`)
        .send({
          chat_id: TELEGRAM_CHAT_ID,
          message_id: messageId,
        })
        .catch((error) => console.error('Error pinning message:', error));
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const sendMessageTea = async () => {
  let today = new Date().toISOString().slice(0, 10);
  if (calendar && calendar?.holidays && calendar?.holidays.includes(today)) {
    return;
  }

  const drinkGifs = getDrinkGif();

  const query = get_random(drinkGifs.gifs);

  const gifUrl = await getRandomGif(query);

  const messageNext = `@everyone! Пора пить ${drinkGifs.name}! \n\n https://jetstyle.zoom.us/j/84795605228?pwd=YzumeOb35bQ4FFcBAHQLKO4Q3CR7Mq.1`;
  try {
    // Отправка сообщения в Telegram через superagent
    const res = await superagent.post(TELEGRAM_API_URL).send({
      chat_id: TELEGRAM_CHAT_ID,
      message_thread_id: message_thread_id,
      animation: gifUrl,
      caption: messageNext,
    });
    // .then(res => console.log('Tea message sent:', res.body))
    // .catch((error) => console.error("Error sending tea message:", error));

    // Закрепление отправленного сообщения
    if (res.body && res.body.result && res.body.result.message_id) {
      const messageId = res.body.result.message_id;

      await superagent
        .post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/pinChatMessage`)
        .send({
          chat_id: TELEGRAM_CHAT_ID,
          message_id: messageId,
        })
        .catch((error) => console.error('Error pinning message:', error));
    }
  } catch (error) {
    console.error('Error sendMessageTea message:', error);
  }
};

const sendMessageWorkLog = async () => {
  try {
    // Отправка сообщения в Telegram через superagent
    const res = await superagent.post(TELEGRAM_API_URL_TEXT).send({
      // TODO сделать картинки
      chat_id: TELEGRAM_CHAT_ID,
      message_thread_id: message_thread_id_work_log,
      text: 'Заполни ворклоги и спи спокойно!',
    });

    // Закрепление отправленного сообщения
    if (res.body && res.body.result && res.body.result.message_id) {
      const messageId = res.body.result.message_id;

      await superagent
        .post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/pinChatMessage`)
        .send({
          chat_id: TELEGRAM_CHAT_ID,
          message_id: messageId,
        })
        .catch((error) => console.error('Error pinning message:', error));
    }
  } catch (error) {
    console.error('Error sendMessageWorkLog message:', error);
  }
};

// Расписание для sendMessage
new CronJob(
  '30 9 * * 1-6',
  () => {
    console.log('CronJob for sendMessage triggered');
    sendMessage();
  },
  null,
  true,
  'Asia/Yekaterinburg'
).start();

// Расписание для sendMessageTea
new CronJob(
  '00 16 * * 5',
  () => {
    console.log('CronJob for sendMessageTea triggered');
    sendMessageTea();
  },
  null,
  true,
  'Asia/Yekaterinburg'
).start();

// Расписание для sendMessageWorkLog
new CronJob(
  '00 18 * * 4',
  () => {
    console.log('CronJob for sendMessageWorkLog triggered');
    sendMessageWorkLog();
  },
  null,
  true,
  'Asia/Yekaterinburg'
).start();

// sendMessage();

// sendMessageTea();

// sendMessageWorkLog();
