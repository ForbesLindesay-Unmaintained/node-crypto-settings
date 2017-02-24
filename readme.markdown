A module to save settings data, it has a fair bit of configurability, but it's 
intended usage is very simple:

# Installation

[![Greenkeeper badge](https://badges.greenkeeper.io/ForbesLindesay/node-crypto-settings.svg)](https://greenkeeper.io/)

    npm install crypto-settings

# Basic Usage

```javascript
var settings = require("crypto-settings")(/* optional options object goes here */);

//make use of any settings required.
```

Command line to start.

    app.js -pass myPasswordWithNoSpaces -print -edit

If used in this fassion, a password can be specified on the command line 
(providing it has no spaces) in the format -pass <my password>

Adding the flag -print will cause the settings object to be printed to the 
console on startup.

Adding the flag -edit will give a command line interface to allow editing of 
settings.  The command line interface has access to a "settings" object.  This 
will be automatically saved when the command line exits.

The settings object returned always has two methods (which should be treated as
reserved words).

## save()

syncronously writes the data back to the file.

## useConsole(callback)

Does the same as if the user had used "-edit" flag, then triggers the callback
once the user has finished editing settings.

# Async mode

Documentation needed.

# Using alternative stores

Documentation needed.