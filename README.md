# Wassup
**Logger for Node.js.**

### Installation

Via npm:

```sh
$ npm i wassup
```

### Enable logging

Just import wassup to your application and call it:

```javascript
require('wassup')();
// Now you have wassup.Logger instance in the GLOBAL.log.
```

You can provide a name for a global logger:

```javascript
require('wassup')('myGlobalLog');
// Now you have wassup.Logger instance in the GLOBAL.myGlobalLog.
```

Also you can create you own logger instance without creating global:

```javascript
var wassup = require('wassup')
  , mylog = new wassup.Logger();
```

or create both globals and your own:

```javascript
// Import wassup and create GLOBAL.log
var wassup = require('wassup')()
// Create two local loggers
  , mylog1 = new wassup.Logger()
  , mylog2 = new wassup.Logger();
// Create one more global instance
wassup('myGlobalLog');
```

### Channels

Channels is a named streams of log messages.

You should configure channels for each logger:

```javascript
log.channel('ERR')
log.channel('WRN')
log.channel('DBG')
log.channel('AUTH')
```

Now you have log.ERR(), log.WRN(), log.DBG() and log.AUTH() functions that pushes log messages to their channels.

### Targets

Target is a log storage. Now wassup supports two types of targets: `console` and `file`.

To see the result of logging, you must create a target and add the channels which you are interested in to it.

```javascript
// Create file output target named 'debug' and add 'DBG' channel to it
log.target('debug', log.file('./debug.log')).add('DBG')
// It's a good idea to see also 'ERR' and 'WRN' channels in our debug log. Let's add it.
// We already have a configured 'debug' channel, so just take it from our logger and add the additional channels.
log.target('debug').add('ERR', 'WRN')
// Also we want to see 'AUTH' channel on our console. Let's do it.
log.target('console').add('AUTH')
// 'console' target is present on each logger by default, so we shouldn't configure it before usage.
```

### Logging

```javascript
log.ERR('Oh! There is an error here: ', err)
log.WRN('The name field is empty!')
log.DBG('Waiting connections...')
log.AUTH('User ', user, ' logged in.')
```

Now we have the first three messages in `./debug.log` file and the last message on our console.

### Add new target type

All you need is a function which takes log record object and puts it into your target. If you need any parameters for your target you can wrap this function into another.

Custom target type example:
```javascript
// Let's create a target that will write to the `stderr` and optionally die after that
function stderr(die) {
  return function(data) {
    console.error(this.utils.tsToStr(data.ts), data.ch, data.msg);
    if(die) proccess.exit(1);
  }
}
// Now create two targets
log.target('stderr', stderr()).add('ERR')
log.target('die', stderr(true)).add('DIE')
// Just prints a message to stderr
log.ERR('I\'m confused...')
// Prints a message and dies
log.DIE('Harakiri!')
```
