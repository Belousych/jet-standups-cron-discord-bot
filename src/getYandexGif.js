const superagent = require('superagent');
const { YANDEX_PUBLIC_FOLDER, FROM_FOLDER, TARGET_FOLDER, YANDEX_OAUTH_TOKEN } = require('./config');
const { get_random } = require('./utils');
let usedIds = [];
const MB = 1024 * 1024;
// Telegram fetches these files directly from the Yandex URL.
// URL uploads allow 5 MB for photos and 20 MB for other media.
const MEDIA_SIZE_LIMITS = new Map([
  ['image/jpeg', 5 * MB],
  ['image/png', 5 * MB],
  ['image/gif', 20 * MB],
  ['video/mp4', 20 * MB],
]);

async function getYandexGif() {
  const response = await superagent.get('https://cloud-api.yandex.net/v1/disk/public/resources')
    .query({ public_key: YANDEX_PUBLIC_FOLDER, limit: 1000 })
    .timeout({ response: 10000, deadline: 20000 });
  const items = (response.body?._embedded?.items || []).filter(item =>
    item.type === 'file'
    && item.file
    && MEDIA_SIZE_LIMITS.has(item.mime_type)
    && item.size <= MEDIA_SIZE_LIMITS.get(item.mime_type));
  let available = items.filter(item => !usedIds.includes(item.resource_id));
  if (!available.length) { usedIds = []; available = items; }
  const item = get_random(available);
  return item ? { ...item, url: item.file, total: available.length - 1 } : null;
}

// Call only after Telegram has successfully sent this exact image.
async function markYandexGifSent(item) {
  usedIds.push(item.resource_id);
  if (!YANDEX_OAUTH_TOKEN) return;
  await superagent.post('https://cloud-api.yandex.net/v1/disk/resources/move')
    .query({ from: `disk:/${FROM_FOLDER}/${item.name}`, path: `disk:/${TARGET_FOLDER}/${item.name}` })
    .set('Authorization', `OAuth ${YANDEX_OAUTH_TOKEN}`)
    .timeout({ response: 10000, deadline: 20000 });
}
module.exports = getYandexGif;
module.exports.markYandexGifSent = markYandexGifSent;
