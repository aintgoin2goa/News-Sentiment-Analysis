var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var loader = require('../helpers/moduleLoader.js');
var Q = require('q');
var Handlebars = require('handlebars');

describe('Notify', function(){

    var templates = {
        success : {
            html : Handlebars.compile(fs.readFileSync('./emails/success.hbs', {encoding:'utf8'})),
            text : Handlebars.compile(fs.readFileSync('./emails/success_text.hbs', {encoding:'utf8'}))
        },
        failure : {
            html : Handlebars.compile(fs.readFileSync('./emails/failure.hbs', {encoding:'utf8'})),
            text : Handlebars.compile(fs.readFileSync('./emails/failure_text.hbs', {encoding:'utf8'}))
        }
    };

    var successObj = {
        template: 'success',
        data : {
            total : 1000,
            publications : [
                {
                    publicationId : 'publication1',
                    added : 10,
                    total : 100
                },
                {
                    publicationId : 'publication2',
                    added : 20,
                    total : 300
                },
                {
                    publicationId : 'publication3',
                    added : 50,
                    total : 600
                }
            ]
        }
    };

    var failureObj = {
        template: 'failure',
        data : {message : "Error", stack: new Error('').stack}
    };

    var notify, nodemailerMock, transporterMock, pathStub;

    beforeEach(function(){
        pathStub = {resolve: function(p){ return p.replace(/^\./, '')}};
        transporterMock = {sendMail : sinon.stub().callsArgWith(1, null, {response:'ok'})};
        nodemailerMock = {createTransport : sinon.stub().returns(transporterMock)};
        notify = loader.loadModule(
            'src/notify.js',
            {
                'nodemailer' : nodemailerMock,
                'path' : pathStub
            },
            'notify.js'
        ).module.exports;
    });

    it('Should accept a serialised success object and generate the html using the template and data given', function(done){
        var expectedHTML = templates.success.html(successObj.data);
        var expectedText = templates.success.text(successObj.data);
        var expectedOptions = {
            from: 'Good News Bad News <paul.wilson66@gmail.com>',
            to: 'paul.wilson66@gmail.com',
            subject: 'GNBN Notification: success',
            html : expectedHTML,
            text : expectedText
        };
        notify(JSON.stringify(successObj)).then(function(){
            debugger;
            try{
                assert(transporterMock.sendMail.calledWith(expectedOptions), "Expected transporter to be called with " + JSON.stringify(expectedOptions,null,2));
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

    it('Should accept a serialised failure object and generate the html using the template and data given', function(done){
        var expectedHTML = templates.failure.html(failureObj.data);
        var expectedText = templates.failure.text(failureObj.data);
        var expectedOptions = {
            from: 'Good News Bad News <paul.wilson66@gmail.com>',
            to: 'paul.wilson66@gmail.com',
            subject: 'GNBN Notification: failure',
            html : expectedHTML,
            text : expectedText
        };
        debugger;
        notify(JSON.stringify(failureObj)).then(function(){
            debugger;
            try{
                assert(transporterMock.sendMail.calledWith(expectedOptions), "Expected transporter to be called with " + JSON.stringify(expectedOptions,null,2));
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });
});
