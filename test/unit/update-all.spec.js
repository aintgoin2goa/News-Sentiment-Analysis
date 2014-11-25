var expect = require('chai').expect;
var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var loader = require('../helpers/moduleLoader.js');
var Q = require('q');

describe('UpdateAll', function(){

    var updateAll, updatePublicationMock, databaseMock, notifyMock;

    var publications = [
        {
            id : 'pub1'
        },
        {
            id : 'pub2'
        },
        {
            id : 'pub3'
        }
    ];

    var stats = {added:2, total:10};

    beforeEach(function(){
        databaseMock = {
            connect : sinon.stub().returns(Q(null)),
            allPublications : sinon.stub().returns(Q(publications))
        };
        updatePublicationMock = sinon.stub().returns(Q(JSON.stringify(stats)));
        notifyMock = sinon.stub().returns(Q(null));
        updateAll = loader.loadModule('src/update-all.js', {
            './database.js' : databaseMock,
            './update-publication.js' : updatePublicationMock,
            './notify.js' : notifyMock
        }, 'update-all.js').module.exports;
    });

    it('Should grab all publications from the database', function(done){
        updateAll().then(function(){
            try{
                assert(databaseMock.allPublications.called) ;
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

    it('Should call update-publication for each publication', function(done){
        updateAll().then(function(){
            try{
                for(var i= 0, l=publications.length; i<l;i++){
                    expect(updatePublicationMock.args[i][0]).to.equal(publications[i].id)
                }
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

    it('Should compile the stats from each call and send them to notify.js', function(done){
        updateAll().then(function(){
            try{
                var obj = JSON.parse(notifyMock.lastCall.args[0]),
                    pub = obj.data.publications[0];
                debugger;
                expect(pub.publicationId).to.equal(publications[0].id);
                expect(pub.total).to.equal(stats.total);
                expect(pub.added).to.equal(stats.added);
                done();
            }catch(e){
                done(e);
            }
        }, done);
    });

});
