var fs = require('fs');
var path = require('path');

var nodemailer = require('nodemailer');
var Q = require('q');
var Handlebars = require('handlebars');

var readFile = Q.nfbind(fs.readFile);

function loadTemplates(obj){
    return Q.all([
        readFile(path.resolve('../emails/' + obj.template + '.hbs'), {encoding:'utf8'}),
        readFile(path.resolve('../emails/' + obj.template + '_text.hbs'), {encoding:'utf8'})
    ]);
}

function getTransporter(){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'paul.wilson66@gmail.com',
            pass: 'correcthorsebatterystaple'
        }
    });

    return Q.nbind(transporter.sendMail, transporter);
}

function getMailOptions(obj){
    return {
        from: 'Good News Bad News <paul.wilson66@gmail.com>', // sender address
        to: 'paul.wilson66@gmail.com', // list of receivers
        subject: 'GNBN Notification: ' + obj.template // Subject line
    };
}

function getContent(obj){
    var dfd = Q.defer();
    loadTemplates(obj).spread(function(html, text){
        var htmlTemplate = Handlebars.compile(html);
        var textTemplate = Handlebars.compile(text);
        dfd.resolve({
            html : htmlTemplate(obj.data),
            text : textTemplate(obj.data)
        });
    }, function(err){
        dfd.reject(err);
    });

    return dfd.promise;
}


function notify(obj){
    var dfd = Q.defer();
    obj = JSON.parse(obj);
    getContent(obj).then(function(content){
        var options = getMailOptions(obj),
            send = getTransporter();

        options.text = content.text;
        options.html = content.html;
        send(options).then(function(info){
            dfd.resolve(info);
        }, function(err){
            dfd.reject(err);
        })
    });

    return dfd.promise;
}

module.exports = notify;