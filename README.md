# #hackfest2018 Bot

This bot was created during Microsoft's #hackfest2018.

## Instructions

To run the bot locally, execute:

```
$ git clone https://github.com/csiebler/hackfestbot2018.git
$ cd hackfestbot2018
$ npm install
$ cat .env
STORAGE_CONNECTION=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=......;
LUIS_MODEL_URL=https://....api.cognitive.microsoft.com/luis/v2.0/apps/....?subscription-key=....&verbose=true&timezoneOffset=0&q=
$ node app.js
```

Then connect to the bot via the Bot Framework Emulator using the following address:

```
http://localhost:3978/api/messages
```