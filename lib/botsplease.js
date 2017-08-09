'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');

var voteData = {};

var talkList = [
  "Here is a list of WDI's lightning talks:",
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
  "Alex May - 5 ways video games could be used to improve our lives",
  "Type the first name of a speaker to cast your vote!"
];

var nameArray = ["david", "sam", "brett", "adrian", "matt", "kit", "danny", "saloni", "sabrina", "javed", "alex"];


var BotsPlease = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'votes_please';
  // this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'BotsPlease.db');

  this.user = null;
  // this.db = voteData;
};

// inherits methods and properties from the Bot constructor
util.inherits(BotsPlease, Bot);

BotsPlease.prototype.run = function() {
  BotsPlease.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};

BotsPlease.prototype._onStart = function() {
  this._loadBotUser();
  // this._connectDb();
  this._welcomeMessage();
};

BotsPlease.prototype._onMessage = function(message) {
  // console.log('username:');
  // console.log(this._getMessageAuthorUsername(message));

  if (this._isChatMessage(message) && this._isDirectConversation(message) && !this.isFromBotsPlease(message)) {
    this._respondUserMessage(message);
  }
};

BotsPlease.prototype._respondUserMessage = function(message) {
  var voteCount = this._checkUserVotes(message);

  if (this._isMentioningVote(message) && voteCount < 2 && voteData[message.user].voting === false) {
  
    this._showLightningTalkList(message);
    voteData[message.user].voting = true;

  } else if (voteData[message.user].voting === true && voteCount <2) {
    if (nameArray.indexOf(message.text.toLowerCase()) > -1) {
      voteData[message.user].votes.push(nameArray[nameArray.indexOf(message.text.toLowerCase())]);
      if (voteData[message.user].votes.length < 2) {
         this.postMessage(message.user, "Thanks! You've voted for " + message.text + ". Enter the name of another speaker to lodge your second vote:", {as_user: true});
      } else {
          this.postMessage(message.user, "Thanks! You've voted for " + message.text + ". You've reached the maximum number of votes. Type `tally` to see the current tally!", {as_user: true});
          voteData[message.user].voting = false;
          this._voteSuccess(message);
      };

    } else {
      this.postMessage(message.user, "Sorry, I can't find that name. Please try again", {as_user: true});
    } 
  } else if (this._isMentioningTally(message) && voteData[message.user].voting === false) {
      this.postMessage(message.user, "The tally is: \n" + this._checkTally(), {as_user: true});
  } else if (voteData[message.user].voting === false) {
      this.postMessage(message.user, "Hi there, I'm votes_please, your friendly, sentient voting bot. You can check the list of talks using `vote` or check the current tally with `tally`.", {as_user: true});
  }
};

BotsPlease.prototype._checkUserVotes = function(message) {
  var userID = message.user

  if (!voteData[userID]) {
    voteData[userID] = {votes: [], voting: false};
  }

  return voteData[userID].votes.length;
};

BotsPlease.prototype._loadBotUser = function() {
  var self = this;
  this.user = this.users.filter(function(user) {
    return user.name === self.name;
  })[0];

};

BotsPlease.prototype._welcomeMessage = function() {
  this.postMessageToChannel(this.channels[0].name, 'Hi everyone, I\'m the WDIConf voting bot, votes_please.' + '\n To vote, start a direct message with me at `' + this.name + '` and say `vote` to get started.', {as_user: false});
};

BotsPlease.prototype._voteSuccess = function(message) {
  this.postMessageToChannel(this.channels[0].name, 'Yayyyy ' + this._getMessageAuthorUsername(message) + ' voted!!!', {as_user: false});
};

BotsPlease.prototype._checkTally = function() {
  var tallyData = {};

  Object.keys(voteData).forEach(function(user) {
    console.log(voteData[user]);
    console.log(voteData[user].votes);
    voteData[user].votes.forEach(function(votedName) {
      if (!tallyData[votedName]) {
        tallyData[votedName] = 1;
    } else {
        tallyData[votedName] ++;
      }
    });
  });

  return this._cleanTally(tallyData);
  // return JSON.stringify(tallyData);
};

BotsPlease.prototype._cleanTally = function(tallyObject) {
  var resultString = ""
  Object.keys(tallyObject).forEach(function(tallyKey) {
    resultString += tallyKey + ': ' + tallyObject[tallyKey] + ' votes. \n'
  });
  return resultString;
};

BotsPlease.prototype._getMessageAuthorUsername = function(message) {
  // var self = this;
  var messageAuthor = this.users.filter(function(user) {
    return user.id === message.user;
  })[0];
  return messageAuthor.real_name
};

BotsPlease.prototype._isChatMessage = function(message) {
  return message.type === 'message' && Boolean(message.text);
};

BotsPlease.prototype._isDirectConversation = function(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'D';
};

BotsPlease.prototype.isFromBotsPlease = function(message) {
  return message.user === this.user.id;
};

BotsPlease.prototype._isMentioningVote = function(message) {
  return message.text.toLowerCase().indexOf('vote') > -1;
};

BotsPlease.prototype._isMentioningTally = function(message) {
  return message.text.toLowerCase().indexOf('tally') > -1;
};

BotsPlease.prototype._showLightningTalkList = function(originalMessage) {
  var self = this;  
  var botMessage = talkList.join("\n");

  self.postMessage(originalMessage.user, botMessage, {as_user: true});
};


BotsPlease.prototype._getChannelById = function(channelId) {
return this.channels.filter(function(item) {
  return item.id === channelId;
})[0];
};

module.exports = BotsPlease;
