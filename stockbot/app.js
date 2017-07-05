var restify = require('restify');
var builder = require('botbuilder');
var https = require('https');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD});

// Listen for messages from users
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back
// (prefixed with 'You said:')
/*var bot = new builder.UniversalBot(connector, function (session) {
    session.send("What is your name?");
    //session.send("You said: %s", session.message.text);
});*/

var stockurl = 'http://finance.google.com/finance/info?client=ig&q=NSE:RBLBANK'

var bot = new builder.UniversalBot(connector);

//bot.localePath(path.join(__dirname, './locale'));

bot.dialog('/', [
    
    function (session) {
         var message = 'Hello user, good to meet you! I now know your address and can send you notifications in the future.';
    session.send(message);
        builder
            .Prompts
            .text(session, "Hello... What's stock price you want");
    },
    function (session, results) {
        session.userData.stockname = results.response;
        var client = restify.createJsonClient({url: 'http://finance.google.com', version: '*'});
   

    client.get('/finance/info?client=ig&q=NSE:' + session.userData.stockname, function (err, req, res, obj) {

        // console.log('%j', obj);
        if (res.statusCode == 200) {

            var body = res.body;
            var body1 = body.replace('//', '');
            var obj = JSON.parse(body1);
            console.log('%j', obj);
            console.log('name: ', obj[0].l);
            //console.log('%d -> %j', res.statusCode, res.body);

            var stockPrice= obj[0].l;
            session.send(session.userData.stockname +" Stock Price: "+stockPrice);
        } else {
        session.endDialog("Its Doesnt look correct Stock name. Please try again");
        }

       

    });

    }
]);
