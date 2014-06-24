
    var assert = require('assert');
    var mongoskin = require('mongoskin');
    var db = mongoskin.db('mongodb://localhost:27017/stuffDb', {safe:true});


    result = [];

    describe('basic database tests', function(){
      before(function(done){
        db.collection('users', function(err, collection) {
          collection.ensureIndex({name:1},{unique:true}, function(err, saved) {
              console.log(err);
              done();
          });
        }); 
      });
      it('should have 5 users', function(done){
        db.collection('users').find().toArray(function  (err,result){
          console.log(result.length);
          assert.equal(result.length,5);
          done();
        });
      });
      it('should be able to insert new user', function(done){
        body={"name":"tim4", "email":"tim@sitebuilt.net", "lists":[]};
        db.collection('users', function(err, collection) {
          collection.insert(body, function(err, saved) {
              //console.log(saved);
              assert.equal(saved[0].name,body.name);
              done();
          });
        });       
      });
      it('should reject a duplicate user', function(done){
        body={"name":"tim4", "email":"tim@sitebuilt.net", "lists":[]};
        db.collection('users', function(err, collection) {
          collection.insert(body, function(err, saved) {
              console.log(err.code);
              assert.equal(err.code,11000);
              done();
          });
        });       
      });
    });
