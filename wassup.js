var fs = require('fs');

// TARGET
var Target = function Target(logger, name, f) {
  logger.targets[name] = this;
  this.logger = logger;
  this.name = name;
  this.f = f;
}
// Add given channels to this target
Target.prototype.add = function add() {
  for(var i in arguments) {
    var channel = arguments[i];
    // Create channel if not exists
    if(!this.logger.channels[channel]) this.logger.channel(channel);
    // Add self to channel
    this.logger.channels[channel][this.name] = this;
  }
  return this;
}

// LOGGER
var Logger = function Logger() {
  this.targets = {};
  this.channels = {};
  new Target(this, 'console', function(data) {
    console.log(this.utils.tsToStr(data.ts) + ' ' + data.ch + ': ' + data.msg);
  });
}
// Return target by name. Create new if not exists.
Logger.prototype.target = function target(name, f) {
  if(typeof f !== 'undefined') return new Target(this, name, f);
  return this.targets[name];
}
// Return channel by name. Create new if not exists.
Logger.prototype.channel = function channel(name) {
  if(!this.channels[name]) {
    var self = this;
    // Add self to log channels list
    this.channels[name] = {};
    // Add logger function
    this[name] = function msg() {
      // console.log('!!!', self);
      var msg = [];
      for(i in arguments) msg.push(typeof arguments[i] === 'object' ? util.inspect(arguments[i]) : arguments[i]);
      var data = { ts: Date.now(), ch: name, msg: msg.join('') };
      for(var target in self.channels[name]) {
        var target = self.channels[name][target];
        if(target) target.f.call(self, data);
      }
    }
  }
  return this;
}

Logger.prototype.utils = {};

// Convert timestamp to string
Logger.prototype.utils.tsToStr = function tsToStr(ts) {
  var d = new Date(ts)
    , Y = d.getFullYear()
    , M = d.getMonth() + 1
    , D = d.getDate()
    , h = d.getHours()
    , m = d.getMinutes()
    , s = d.getSeconds()
    , u = d.getMilliseconds();
  // Format date
  M = ('0' + ++M).slice(-2);
  D = ('0' + D).slice(-2);
  h = ('0' + h).slice(-2);
  m = ('0' + m).slice(-2);
  s = ('0' + s).slice(-2);
  u = ('00' + u).slice(-3);

  return Y + '.' + M + '.' + D + ' ' + h + ':' + m + ':' + s + '.' + u;    
}

// TARGETS

// File target
Logger.prototype.file = function file(name, mode) {
  var stream = fs.createWriteStream(name, { flags: 'a', encoding: null, mode: mode});
  return function file(data) {
    stream.write(this.utils.tsToStr(data.ts) + ' ' + data.ch + ': ' + data.msg + '\n');
  }
}

// MODULE INTERFACE

function init(globalName) {
  globalName = globalName || 'log';
  if(!(GLOBAL[globalName] instanceof Logger)) {
    GLOBAL[globalName] = new Logger();
  }
  return module.exports;
}

init.Logger = Logger;

module.exports = init;
