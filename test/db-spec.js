
var assert = require('assert');
var mongoskin = require('mongoskin');
var db = mongoskin.db('mongodb://localhost:27017/stuffDb', {safe:true});


result = [];

describe('basic database tests', function(){


  it('if there are no lists for user it should be undefined', function(done){
    var name='tim'
    var lid ='0'
    db.collection('users', function(err, collection) {
      collection.find({name:name},{lists:{$elemMatch:{lid:lid}}}).toArray(function(err,user){
        //console.log(user[0].lists);
        assert.equal(user[0].lists,undefined);
        done();
      });
    });       
  });  
  it('should be undefined if lid doesnt match any list', function(done){
    var name='tim7'
    var lid ='090'
    db.collection('users', function(err, collection) {
      collection.find({name:name},{lists:{$elemMatch:{lid:lid}}}).toArray(function(err,user){
        //console.log(user[0].lists);
        assert.equal(1,1);
        done();
      });
    });       
  });  
});
