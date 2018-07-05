var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");
require('dotenv').config();

const STORAGE_CONNECTION = process.env.STORAGE_CONNECTION;
const LUIS_MODEL_URL = process.env.LUIS_MODEL_URL;

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

server.post('/api/messages', connector.listen());

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, STORAGE_CONNECTION);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

var recognizer = new builder.LuisRecognizer(LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded && message.membersAdded.length > 0) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/')
            }
        });
    }
});

bot.dialog('/', function (session) {
    session.send('Welcome to BIBO!');
    session.send('You can ask me things like "show me this year\'s sales numbers\'');
}).triggerAction({
    matches: 'Greeting'
});

bot.dialog('Show-KPIs', [
    function (session) {

        var query = session.message.text;
        session.send(`Your query was: ${query}`);
        var msg = new builder.Message(session);
        msg.attachmentLayout(builder.AttachmentLayout.carousel)
        msg.attachments([
            new builder.HeroCard(session)
                .title("Your numbers")
                .images([builder.CardImage.create(session, 'https://oxcrx34285.i.lithium.com/t5/image/serverpage/image-id/18454iF5B3541309A64563/image-size/large?v=1.0&px=600')])
        ]);
        session.send(msg);
        session.endDialog();
    }
]).triggerAction({
    matches: 'show-kpis'
});

bot.dialog('help', function (session) {
    session.endDialog("You can ask me things like<br>'Show me the sales numbers for this quarter'<br>'how many items did we sell in Germany?'");
}).triggerAction({
    matches: 'Help'
});

bot.dialog('Liebherr-Info', function (session) {
    var query = session.message.text;
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("Liebherr Company Information")
            .images([builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Liebherr-Logo.svg/1034px-Liebherr-Logo.svg.png')])
            .buttons([
                builder.CardAction.openUrl(session, 'https://de.wikipedia.org/wiki/Liebherr', 'More information')
            ]),
    ]);
    session.send(msg);
    session.endDialog();
}).triggerAction({
    matches: 'liebherr-info'
});