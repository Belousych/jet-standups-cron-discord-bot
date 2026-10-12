const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.TELEGRAM_TOKEN = 'test-token';
process.env.TELEGRAM_CHAT_ID = 'test-chat';
process.env.YANDEX_OAUTH_TOKEN = 'test-oauth';
const agent = require('superagent');
const originalGet = agent.get;
const originalPost = agent.post;
const gifPath = require.resolve('../src/findRandomGifs');
require(gifPath);
require.cache[gifPath].exports.getRandomGif = async () => 'https://example.test/fallback.gif';
const bot = require('../index');

for (const scenario of ['success', 'yandex-down', 'image-rejected', 'all-media-rejected', 'text-rejected']) {
  test(scenario, async () => {
    const calls = [];
    const item = { type: 'file', file: 'https://example.test/photo.jpg', name: 'photo.jpg', resource_id: scenario, mime_type: 'image/jpeg', size: 100 };
    agent.get = () => ({ query() { return this; }, timeout() {
      if (scenario === 'yandex-down') return Promise.reject({ code: 'ETIMEDOUT' });
      return Promise.resolve({ body: { _embedded: { items: [item] } } });
    } });
    agent.post = url => {
      const method = url.split('/').pop();
      return { query() { return this; }, set() { return this; }, send(payload) { this.payload = payload; return this; }, timeout() {
        calls.push(method);
        const reject = method === 'sendPhoto' && ['image-rejected', 'all-media-rejected', 'text-rejected'].includes(scenario)
          || method === 'sendAnimation' && ['all-media-rejected', 'text-rejected'].includes(scenario)
          || method === 'sendMessage' && scenario === 'text-rejected';
        return reject ? Promise.reject({ status: 400, response: { body: { description: 'rejected' } } })
          : Promise.resolve({ body: { ok: true, result: { message_id: 1 } } });
      } };
    };
    try {
      if (scenario === 'text-rejected') await assert.rejects(bot.sendMessage({ force: true }));
      else await bot.sendMessage({ force: true });
      if (scenario === 'success') assert.deepEqual(calls.slice(0, 2), ['sendPhoto', 'move']);
      else assert.equal(calls.includes('move'), false);
      if (scenario === 'yandex-down' || scenario === 'image-rejected') assert.ok(calls.includes('sendAnimation'));
      if (scenario === 'all-media-rejected') assert.ok(calls.includes('sendMessage'));
      if (scenario === 'text-rejected') assert.equal(calls.includes('pinChatMessage'), false);
    } finally { agent.get = originalGet; agent.post = originalPost; }
  });
}
