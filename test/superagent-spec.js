var superagent = require('superagent')
var expect = require('expect.js')
var should = require('should')
var _ = require('underscore')
var myut = require('../util/myutil.js');

var httpLoc = 'http://localhost:3000/api/'

describe('superagent:', function(){
  var agent = superagent.agent();
  var name = 'tim7';
  var ucnt = 0;
  var listId = 'Jutebi';
  var apikey='Natacitipavuwunexelisaci';
  var otherListId = 'Vegada';
  var listShops = 'groceries';
  it('GET / should be running and return: please select...', function(done){
    superagent.get(httpLoc)
      .end(function(e, res){
        //console.log(res.body)
        expect(e).to.eql(null)
        expect(res.body.length).to.be.above(0)
        expect(res.body).to.be.a('string')
        done()
      })    
  })
  describe('users', function(){
    it('POSTs succeeds for fake user for correct apikey',function(done){
      agent
        .post('http://localhost:3000/api/authenticate')
        .send({apikey:apikey})
        .end(function(e,res){
          console.log(res.body

            )
          expect(res.body.apikey).to.be(apikey);
          expect(1).to.eql(1);
          done();
        })
    })
    it('GETs succeeds w userinfo from api/account when authenticated', function(done){
      agent
        .get('http://localhost:3000/api/account/')
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.apikey).to.be(apikey);
          done()
        })
    })    
    it('GETs succeeds api/lists/Jutebi when authenticated', function(done){
      agent
        .get(httpLoc+'lists/'+listId)
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.lid).to.be('Jutebi');
          done()
        })
    })        
    it('DELs users/:name from users->success=1', function(done){
      superagent.del(httpLoc+'users/'+name)
        .end(function(e, res){
          //console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body).to.eql(1)
          done()
        })
    }) 
    it('GETs {} if users/:tim7 doesnt exist', function(done){
      superagent.get(httpLoc+'users/'+name)
        .end(function(e,res){
          //console.log(res.body)
          expect(res.body).to.eql({})
          done()
        })
    })    
    it('GETs all users and counts em', function(done){
      superagent.get(httpLoc+'users')
        .end(function(e, res){
          // console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body.length).to.be.above(0)
          expect(res.body).to.be.an('array')
          //possible util 
          var listOfUsers= res.body.map(function (item){return item.name});
          //console.log(listOfUsers);
          ucnt = listOfUsers.length;
          //console.log(ucnt);
          done()
        })
    })
    it('GETs isUser/:tim7 is available', function(done){
      superagent.get(httpLoc+'isUser/'+name)
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.message).to.eql(' available')
          done()
        })
    })
    it('POSTs a new /user/:tim7 -> full array of objects ', function(done){
      superagent.post(httpLoc+'users')
        .send({name:name, email:"tim@sitebuilt.net", lists:[],role:'user', timestamp:1399208688, apikey:'Qemavohegoburuxosuqujoga' })
        .end(function(e,res){
          console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body.length).to.eql(1)
          expect(res.body[0]._id.length).to.eql(24)
          expect(res.body[0].name).to.be(name)
          done()
        })    
    })
    it('GETs all users expecting the count to go up', function(done){
      superagent.get(httpLoc+'users')
        .end(function(e, res){
          // console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body.length).to.be.above(0)
          expect(res.body).to.be.an('array')
          //possible util 
          var listOfUsers= res.body.map(function (item){return item.name});
          //console.log(listOfUsers);
          expect(listOfUsers.length).to.be(ucnt+1);
          //console.log(listOfUsers.length);
          done()
        })
    })
       
    it('GETs a users/:tim7', function(done){
      superagent.get(httpLoc+'users/'+name)
        .end(function(e,res){
          //console.log(res.body)
          expect(res.body.name).to.eql(name)
          done()
        })
    })

    it('GETs a users/id/:id', function(done){
      superagent.get(httpLoc+'users/id/4')
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.id).to.eql(4)
          done()
        })
    })
       
    it('GETs username is already registered for isUser/:tim7', function(done){
      superagent.get(httpLoc+'isUser/'+name)
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.message).to.eql(' already registered')
          done()
        })
    })
    it('rejects POST of duplicate user/:tim7 ->11000', function(done){
      superagent.post(httpLoc+'users')
        .send({name:name, email:"tim@sitebuilt.net", lists:[], apikey: ""})
        .end(function(e,res){
          console.log(res.body.code)
          expect(res.body.code).to.eql(11000)
          done()
        })    
    })

    it('PUTs an existing :list on /users/:name/:listId->list', function(done){
      superagent.put(httpLoc+'users/'+name+'/'+listId)
        .send()
        .end(function(e, res){
          console.log(res.body)
          expect(e).to.eql(null)
          expect(typeof res.body).to.eql('object')
          expect(res.body.lid).to.eql(listId) 
          expect(res.body.shops).to.be(listShops)       
          done()
        })
    })
    it('rejects a PUT of new :list on /users->list already included', function(done){
      superagent.put(httpLoc+'users/'+name+'/'+listId)
        .send()
        .end(function(e, res){
          //console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body).to.be('list already included')       
          done()
        })
    })    
    it('reject a PUT of :list for user -> null list with that id', function(done){
      superagent.put(httpLoc+'users/'+name+'/'+otherListId)
        .send()
        .end(function(e, res){
          //console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body).to.be('null list with that lid')       
          done()
        })
    })         
  })

/*----------------------------------------------------------------------------------*/
  describe('lists', function(){
    var newListId;
    var shops = 'testShop2';

    it('POSTs (creates) a new list',function(done){
      superagent.post(httpLoc+'lists/'+shops)
        .send()
        .end(function(e,res){
          //console.log(res.body)
          newListId = res.body[0].lid
          //console.log(lid)
          expect(res.body[0].shops).to.eql(shops)
          done()
        })
    })
    it('GETs authenticated /lists/:lid', function(done){
      agent
        .get(httpLoc+'lists/'+listId)
        .end(function(e,res){
          expect(e).to.be(null)
          console.log(res.body)
          expect(res.body.lid).to.be(listId)
          done()
        })
    })

    it('DELs a list by :lid', function(done){
      superagent.del(httpLoc+'lists/'+newListId)
        .end(function(e, res){
          //console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body).to.eql(1)
          done()
        })      
    })
    it('PUTs updates /list timestamp', function(done){
      superagent.put(httpLoc+'lists/'+listId)
        .send({timestamp:Date.now()})
        .end(function(e, res){
          //console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body).to.eql(1)
          done()
        })
    })
  })
/*----------------------------------------------------------------------------------*/
  describe('authentication', function(){
    var ureg='tim';
    var uav='fred';
    var eregtim = 'mckenna.tim@gmail.com';
    var enottim = 'mckenna.nottim@gmail.com';
    //before(loginUser(agent));    
    it('POSTs succeeds for fake user for correct apikey',function(done){
      agent
        .post('http://localhost:3000/api/authenticate')
        .send({apikey:apikey})
        .end(function(e,res){
          console.log(res.body

            )
          expect(res.body.apikey).to.be(apikey);
          expect(1).to.eql(1);
          done();
        })
    })
    it('GETs succeeds w userinfo from api/account when authenticated', function(done){
      agent
        .get('http://localhost:3000/api/account/')
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.apikey).to.be(apikey);
          done()
        })
    })
    it('POSTs fails with error for fake user with wrong apikey',function(done){
      agent
        .post('http://localhost:3000/api/authenticate')
        .send({apikey:'123457'})
        .end(function(e,res){
          console.log(res.body);
          expect(res.body.message).to.be('Authentication Error');
          done();
        })
    })
    it('GETs fails with error for api/account fails when not authenticated', function(done){
      agent
        .get('http://localhost:3000/api/account/')
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.message).to.be('Authentication Error');
          done()
        })
    })
    it('gets a [conflict] to existing user and email', function(done){
      agent
        .get(httpLoc+'isMatch/?user='+ureg+'&email=f'+eregtim)
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.message).to.be('conflict')
          done()
        })
    })
    it('gets a [match] to existing user and email', function(done){
      agent
        .get(httpLoc+'isMatch/?user='+ureg+'&email='+eregtim)
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.message).to.be('match')
          done()
        })
    })
    it('gets available -> posts/creates user expected to return user rec for [timz] ', function(done){
      agent
        .get(httpLoc+'isMatch/?user='+ureg+'z&email=z'+eregtim)
        .end(function(e,res){
          console.log(res.body)
          expect(res.body.message).to.be('available')
          done()
        })
    })
    it('DELs users/:name from users->success=1', function(done){
      superagent.del(httpLoc+'users/'+ureg+'z')
        .end(function(e, res){
          console.log(res.body)
          expect(e).to.eql(null)
          expect(res.body).to.eql(1)
          done()
        })
    }) 
  })  
})