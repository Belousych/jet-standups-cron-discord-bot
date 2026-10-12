// Load the same environment as PM2, without starting another scheduler.
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, 'ecosystem.config.js');
if (fs.existsSync(configPath)) {
  const config = require(configPath);
  const app = config.apps?.find(app => app.name === 'jet-standups-bot');
  if (!app) throw new Error('jet-standups-bot missing from ecosystem.config.js');
  const environment = process.env.PM2_ENV;
  Object.assign(process.env, app.env || {}, environment ? app[`env_${environment}`] || {} : {});
}
require('./index').main().catch(error => {
  console.error('Manual send failed:', error.response?.body?.description || error.code || 'Check configuration and bot logs');
  process.exitCode = 1;
});
