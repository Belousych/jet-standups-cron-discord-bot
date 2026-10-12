require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { CronJob } = require('cron');
const superagent = require('superagent');
const calendar = require('./consultant2026.json');
const { gifQ, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, getDrinkGif } = require('./src/config');
const { getRandomGif } = require('./src/findRandomGifs');
const getYandexGif = require('./src/getYandexGif');
const { markYandexGifSent } = getYandexGif;
const { get_random } = require('./src/utils');
const TIME_ZONE = 'Asia/Yekaterinburg';
const STANDUP_TEXT = 'Доброе утро, @everyone !!!\n\nДо 11:00 ЕКБ оставьте в чате сообщение, которое отвечает на три вопроса:\n\n1. Кто мы? (кто пишет)\n2. Откуда мы? (В каком проекте)\n3. Куда мы идем? (Что собирается сделать. Желательно подумать или описать желаемый достижимый результат)\n\nЕсли у вас есть событие или требуется помощь или синхронизация — написать про это тоже. Поменьшить людей, с которыми будет нужно синхронизироваться.\n\n---\n\nПрочее\n- Задавать вопросы и уточнять у других — очень хорошо!\n- Ставить лайки, делать суб-обсуждения и т.п. — очень хорошо!\n- Постить гифки и стикеры — в меру — хорошо!\n';
let pinnedMessageIds = [];

function logError(label, error) {
  // Never log raw superagent errors: request URLs contain the bot token.
  console.error(new Date().toISOString(), label, {
    status: error.status, description: error.response?.body?.description || error.code || 'Request failed',
  });
}
function skipHoliday(force) {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date());
  if (!force && calendar.holidays.includes(date)) {
    console.log(`${date}: holiday, skipping`);
    return true;
  }
  return false;
}
async function telegram(method, payload) {
  const response = await superagent.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`)
    .send({ chat_id: TELEGRAM_CHAT_ID, ...payload })
    .timeout({ response: 15000, deadline: 30000 });
  if (!response.body.ok) throw new Error('Telegram rejected request');
  return response.body.result;
}
async function tryMedia(media, text) {
  if (!media?.url) return null;
  const photo = ['image/png', 'image/jpeg'].includes(media.mime_type);
  try {
    return await telegram(photo ? 'sendPhoto' : 'sendAnimation', {
      message_thread_id: 48, [photo ? 'photo' : 'animation']: media.url, caption: text,
    });
  } catch (error) { logError('Media send failed; trying fallback', error); return null; }
}
async function pinMessage(message, track = false) {
  if (track) pinnedMessageIds.push(message.message_id);
  try {
    await telegram('pinChatMessage', { message_id: message.message_id });
    if (pinnedMessageIds.length > 7) {
      while (pinnedMessageIds.length > 5) {
        await telegram('unpinChatMessage', { message_id: pinnedMessageIds[0] });
        pinnedMessageIds.shift();
      }
    }
  } catch (error) { logError('Pin/unpin failed', error); }
}
async function sendMessage({ force = false } = {}) {
  if (skipHoliday(force)) return;
  let media;
  try { media = await getYandexGif(); }
  catch (error) { logError('Yandex unavailable; trying Giphy', error); }
  let sent = await tryMedia(media, STANDUP_TEXT);
  if (sent) {
    try { await markYandexGifSent(media); }
    catch (error) { logError('Image sent, but archive move failed', error); }
  } else {
    const url = await getRandomGif(get_random(gifQ));
    sent = await tryMedia({ url }, STANDUP_TEXT);
  }
  if (!sent) sent = await telegram('sendMessage', { message_thread_id: 48, text: STANDUP_TEXT });
  console.log('Standup sent:', sent.message_id);
  await pinMessage(sent, true);
}
async function sendMessageTea({ force = false } = {}) {
  if (skipHoliday(force)) return;
  const drink = getDrinkGif();
  const text = `@everyone! Пора пить ${drink.name}! \n\n https://jetstyle.zoom.us/j/84795605228?pwd=YzumeOb35bQ4FFcBAHQLKO4Q3CR7Mq.1`;
  const url = await getRandomGif(get_random(drink.gifs));
  const sent = await tryMedia({ url }, text) || await telegram('sendMessage', { message_thread_id: 48, text });
  console.log('Tea sent:', sent.message_id);
  await pinMessage(sent);
}
async function sendMessageWorkLog() {
  const sent = await telegram('sendMessage', { message_thread_id: 40, text: 'Заполни ворклоги и спи спокойно!' });
  console.log('Worklog sent:', sent.message_id);
  await pinMessage(sent);
}
const actions = { standup: sendMessage, tea: sendMessageTea, worklog: sendMessageWorkLog };
async function main(args = process.argv.slice(2)) {
  const command = args[0];
  if (command && (!actions[command] || args.slice(1).some(arg => arg !== '--force'))) {
    throw new Error('Usage: node index.js [standup|tea|worklog] [--force]');
  }
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) throw new Error('Set TELEGRAM_TOKEN and TELEGRAM_CHAT_ID');
  if (command) { await actions[command]({ force: args.includes('--force') }); return; }
  for (const [schedule, action] of [['30 9 * * 1-6', 'standup'], ['0 16 * * 5', 'tea'], ['0 18 * * 4', 'worklog']]) {
    new CronJob(schedule, () => {
      console.log(new Date().toISOString(), `CronJob ${action} triggered`);
      actions[action]().catch(error => logError(`${action} failed`, error));
    }, null, true, TIME_ZONE);
  }
  console.log(`Scheduler started (${TIME_ZONE})`);
}
if (require.main === module) main().catch(error => {
  logError(error.message?.startsWith('Usage:') || error.message?.startsWith('Set ') ? error.message : 'Bot failed', error);
  process.exitCode = 1;
});
module.exports = { main, sendMessage, sendMessageTea, sendMessageWorkLog };
