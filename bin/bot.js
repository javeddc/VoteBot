var BotsPlease = require('../lib/botsplease');

var token = process.env.BOT_API_KEY;
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;

var botsPlease = new BotsPlease({
    token: token,
    dbPath: dbPath,
    name: name
});

botsPlease.run();
