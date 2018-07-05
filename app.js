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
    session.send('Hello, I\'m BIBO your virtual KPI assistant!');
    session.beginDialog("help");
}).triggerAction({
    matches: 'Greeting'
});

bot.dialog('Show-KPIs', [
    function (session) {
        var query = session.message.text;
        session.send(`Your query was: ${query}`);
        var imageURL = "https://hackfestbot2018ac33.blob.core.windows.net/images/1.jpg";
        if (query.toLowerCase().startsWith("stores that were opened"))
            imageURL = "https://hackfestbot2018ac33.blob.core.windows.net/images/1.jpg";
        else if (query.toLowerCase().startsWith("gross margin variance"))
            imageURL = "https://hackfestbot2018ac33.blob.core.windows.net/images/2.jpg";
        else if (query.toLowerCase().startsWith("average unit price by month"))
            imageURL = "https://hackfestbot2018ac33.blob.core.windows.net/images/3.jpg";
        else if (query.toLowerCase().startsWith("average selling area size by city as pie"))
            imageURL = "https://hackfestbot2018ac33.blob.core.windows.net/images/4.jpg";
        else if (query.toLowerCase().startsWith("avg $/unit ly per category as clustered column chart"))
            imageURL = "https://hackfestbot2018ac33.blob.core.windows.net/images/5.jpg";
        else
            session.send("Sorry, I cannot help with this yet.");
        session.send({
            text: "Your query results: ",
            attachments: [
                {
                    contentType: "image/jpeg",
                    contentUrl: imageURL
                }
            ]
        });

        // var queryURL = "http://239f9017.ngrok.io/api/pbiqna/" + encodeURI(query);
        // session.sendTyping();
        // session.send({
        //     text: "Your query results:",
        //     attachments: [
        //         {
        //             contentType: "image/jpg",
        //             contentUrl: queryURL,
        //             name: "results2"
        //         }
        //     ]
        // });

        
        session.endDialog();
    }
]).triggerAction({
    matches: 'show-kpis'
});

bot.dialog('help', function (session) {
    session.send("You can ask me things like:<br>" +
        "* average unit price by month in 2014 <br>" +
        "* average selling area size by city as pie <br>" +
        "* avg $/unit ly per category as clustered column chart <br>" +
        "* stores that were opened in 2014 <br>" +
        "* gross margin variance to last year by time");
    var msg = new builder.Message(session)
        .suggestedActions(
            builder.SuggestedActions.create(
                session, [
                    builder.CardAction.imBack(session, "average unit price by month in 2014", "average unit price by month in 2014"),
                    builder.CardAction.imBack(session, "average selling area size by city as pie", "average selling area size by city as pie"),
                    builder.CardAction.imBack(session, "avg $/unit ly per category as clustered column chart", "avg $/unit ly per category as clustered column chart"),
                    builder.CardAction.imBack(session, "stores that were opened in 2014", "stores that were opened in 2014"),
                    builder.CardAction.imBack(session, "gross margin variance to last year by time", "gross margin variance to last year by time"),
                ]
            ));
    session.send(msg);
    session.endDialog();
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
            .images([builder.CardImage.create(session, 'https://hackfestbot2018ac33.blob.core.windows.net/images/logo.png')])
            .buttons([
                builder.CardAction.openUrl(session, 'https://de.wikipedia.org/wiki/Liebherr', 'More information')
            ]),
    ]);
    session.send(msg);
    session.endDialog();
}).triggerAction({
    matches: 'liebherr-info'
});


bot.dialog('appreciation', function (session) {
    session.endDialog("Thank you, I love you too! Please come back soon and vote for LIEBHERR 😀");
}).triggerAction({
    matches: 'appreciation'
});

bot.dialog('goodbye', function (session) {
    session.endDialog("Okay, bye bye - Hope to see soon! And by the way, please vote for LIEBHERR 😀");
}).triggerAction({
    matches: 'goodbye'
});