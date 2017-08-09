'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var voteData = {
  people: [
    'Adrian', 'Javed', 'Alex'
  ],
  votes: {'javed': ['adrian', 'alexmay']}
}

var talkList = [
  "David McDeavitt - Fintech For All",
  "Sam Young - Virtualization Today",
  "Brett Creemer - The Box Model or How I Learned to Love Again",
  "Adrian Mancuso - Breaking from Loops - Functional Programming in JS",
  "Matt Aitken - Twitch streamers & the new age of eSports",
  "Kit Perez - Exploring Continuous Integration with Travis",
  "Danny Li - Create pixelated version of an image using p5.js",
  "Saloni Tulsiyan- Data Structure- Linked List",
  "Sabrina Swatee - Promises in JavaScript",
  "Javed Decosta - Machine Does A Learn",
  "Alex May - 5 ways video games could be used to improve our lives"
];

var NorrisBot = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'norris';
  // this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'norrisbot.db');

  this.user = null;
  // this.db = voteData;
};

// inherits methods and properties from the Bot constructor
util.inherits(NorrisBot, Bot);

NorrisBot.prototype.run = function() {
  NorrisBot.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};

NorrisBot.prototype._onStart = function() {
  this._loadBotUser();
  // this._connectDb();
  this._welcomeMessage();
};

NorrisBot.prototype._onMessage = function(message) {
  console.log('MESSAGE:');
  console.log(message);

  if (this._isChatMessage(message) && this._isDirectConversation(message) && !this._isFromNorrisBot(message) && this._isMentioningChuckNorris(message)) {
    this._replyWithRandomJoke(message);
  }
};


NorrisBot.prototype._loadBotUser = function() {
  var self = this;
  this.user = this.users.filter(function(user) {
    return user.name === self.name;
  })[0];

};

NorrisBot.prototype._welcomeMessage = function() {
  this.postMessageToChannel(this.channels[0].name, 'Hi everyone, I\'m the WDIConf voting bot, BotsPlease.' + '\n To vote, start a direct message with me at `' + this.name + '` and say `vote` to get started.', {as_user: false});

};



NorrisBot.prototype._isChatMessage = function(message) {
  return message.type === 'message' && Boolean(message.text);

};

NorrisBot.prototype._isDirectConversation = function(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'D';
};

NorrisBot.prototype._isFromNorrisBot = function(message) {

  return message.user === this.user.id;
};

NorrisBot.prototype._isMentioningChuckNorris = function(message) {
  return message.text.toLowerCase().indexOf('chuck norris') > -1 || message.text.toLowerCase().indexOf(this.name) > -1;
};

NorrisBot.prototype._replyWithRandomJoke = function(originalMessage) {
  var self = this;
  // var channel = self._getChannelById(originalMessage.channel);
  // self.postMessageToChannel(channel.name, 'hi i can do a vote for u', {as_user: true});
  // self.postMessageToChannel(channel.name, 'hi i can do a vote for u', {as_user: true});
  console.log('original message user:');
  console.log(originalMessage.user);
  self.postMessage(originalMessage.user, 'adsjhakjsdh', {as_user: true})

};

NorrisBot.prototype._getChannelById = function(channelId) {
return this.channels.filter(function(item) {
  return item.id === channelId;
})[0];
};

module.exports = NorrisBot;
