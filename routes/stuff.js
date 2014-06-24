console.log("in stuff")
var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,    
    db;
//to translate mongo id string to mongo _id
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('../util/myutil.js')

/*---------------------------------------------------------------------------*/
var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db("stuffDb");
    //var mongoskin = require('mongoskin')
    //var db = mongoskin.db('mongodb://localhost:27017/stuffTest', {safe:true})
    //var db = require('../config/dbConfig')
    //console.log(db)
    db.collection('users', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The 'users' collection doesn't exist. Creating it with sample data...");
        populateDB(users);
        db.collection('users', function(err, collection) {
          collection.ensureIndex({name:1},{unique:true}, function(err, saved) {
              //console.log(err);
          });
        });
      };
    });  
    //console.log(db)
    db.collection('lists', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The 'lists' collection doesn't exist. Creating it with sample data...");
        populateDB(lists);
        db.collection('lists', function(err, collection) {
          collection.ensureIndex({lid:1}, function(err, saved) {
              //console.log(err);
          });
        });        
      }
    });
    db.collection('products', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The 'products' collection doesn't exist. Creating it with sample data...");
        populateDB(products);
        db.collection('products', function(err, collection) {
          collection.ensureIndex({lid:1,done:-1,product:1}, function(err, saved) {
              //console.log(err);
          });
        });
      }
    });     
}); 


var find =function(na, res){
    db.collection(na, function(err, collection) {
        collection.find().toArray(function(err, items) {
            if(err){res.jsonp(err)}else{res.jsonp(items)};
        });
    });
};

exports.findLists = function(req, res) {
    console.log('in findLists');
    find('lists', res);
};
exports.findUsers = function(req, res) {
    console.log('in findLists');
    find('users', res);
};
exports.findProducts = function(req, res) {
    console.log('in findLists');
    find('products', res);
};
/*-------------------USER functions----------------------------*/

exports.createUser = function(req, res){
  console.log('in createUser');
  console.log(req.body);
  var body= req.body; 
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
  db.collection('users', function(err, collection) {
      collection.insert(body, function(err, saved) {
          if(err){res.jsonp(err)}else{res.jsonp(saved)};
      });
  });      
};
exports.deleteUser = function(req, res){
  console.log('in delete user by name');
  console.log(req.params);
  var name = req.params.name;
  db.collection('users', function(err, collection) {
    collection.remove({name:name}, function(err, saved) {
      if(err){res.jsonp(err)}else{res.jsonp(saved)};
    });
  });      
};
exports.findUserByName = function(req, res) {
    console.log('in find user by name');
    console.log(req.params);
    var name = req.params.name;
    db.collection('users', function(err, collection) {
        collection.findOne({name:name},function(err, items) {
            console.log(items);
            res.jsonp(items);
        });
    });
};

exports.addList2user = function(req, res){
  console.log('in addList2user');
  var name =req.params.name; 
  var lid =req.params.lid;
  var shopName;
  //var ObjectId = require('mongoose').Types.ObjectId;
  db.collection('lists', function(err, collection) {
    collection.findOne({lid:lid}, function(err, alist) {
      if(err){
        res.jsonp(err);
      }else if (alist==null){
        res.jsonp("null list with that lid");
      } else {
        shopName=alist.shops
        db.collection('users', function(err, collection) {
          collection.find({name:name},{lists:{$elemMatch:{lid:lid}}}).toArray(function(err,userLid){
            //console.log(userLid[0].lists==undefined)
            //console.log(userLid[0].lists)
            if (err){
              ret.jsonp(err)
            }else if(userLid[0].lists!=undefined){
              console.log('!undefined-list already included');
              res.jsonp('list already included');
            }else{
              collection.find({name:name},{lists:{$elemMatch:{shops:shopName}}}).toArray(function(err,userName){
                console.log(userName);
                if(userName[0].lists!=undefined){
                  console.log('!undefined-name taken, choose another');
                  res.jsonp('name taken, choose another');
                }else{
                  var ulist = {lid:alist.lid, shops:alist.shops}
                  collection.update({name:name},{$push:{lists:ulist}}, {upsert:false}, function(err, saved) {
                    if(err){res.jsonp(err)}else{
                      console.log('adding this list')
                      res.jsonp(ulist)};
                  });
                }
              });
            }                                      
          });
        });       
      }
    });
  });
};


/*--------------------------------LIST functions----------------------------------------*/

exports.getList=function(req,res){
  console.log('in getList by lid');
  console.log(req.params);
  var lid = req.params.lid;
  db.collection('lists', function(err, collection) {
    collection.findOne({lid:lid}, function(err, items) {
      if(err){res.jsonp(err)}else{res.jsonp(items)};
    })
  })
}
exports.createList=function(req,res){
  console.log('in createList w shops');
  console.log(req.params.shops);
  var shops = req.params.shops;
  var body= {lid:util.ity.createRandomWord(6), shops:shops, timestamp:Date.now()} 
  console.log(body);
  db.collection('lists', function(err, collection) {
      collection.insert(body, function(err, saved) {
          if(err){res.jsonp(err)}else{res.jsonp(saved)};
      });
  });  
}
exports.deleteList=function(req,res){
  console.log('in delete list by lid');
  console.log(req.params);
  var lid = req.params.lid;
  db.collection('lists', function(err, collection) {
    collection.remove({lid:lid}, function(err, saved) {
      if(err){res.jsonp(err)}else{res.jsonp(saved)};
    });
  });      
}
exports.updateList = function(req,res){
  console.log('in update list/:lid');
  console.log(req.params);
  var body=req.body;
  var lid = req.params.lid;
  db.collection('lists', function(err, collection) {
    collection.update({lid:lid},{$set:body},function(err, items) {
      console.log(items);
      res.jsonp(items);
    });
  });
};


/*------------------------------support functions----------------------------------*/
var updListTimestamp=function(db,lid){
  console.log('in updListTimestamp')
  var timestamp = Date.now()
  console.log(timestamp) 
  db.collection('lists', function(err, collection) {
    collection.update({lid:lid},{$set:{timestamp:timestamp}},function(err, items) {
      console.log(items);
    });
  });
}
var getLidUpdTimestamp=function(db,pid, callback){
  console.log('in getLidUpdTimestamp')
  //var apid=ObjectId(pid)
  //console.log(apid)
  db.collection('products', function(err, collection) {
    collection.findOne({_id:pid},function(err, items) {
      console.log(items);
      updListTimestamp(db,items.lid);
    });
  });
  callback();
}

/*------------------------------------------------------------------------------------------------*/

var populateDB = function(huh) {
    console.log("Populating database...");
    var name= huh.name;
    var coll= huh.items;
    db.collection(name, function(err, collection) {
        collection.insert(coll, {safe:true}, function(err, result) {});
        //console.log(result);
    });
};


var products =[];
products.name = 'products';
products.items = [   
{lid:'1',product:'banana', done:false, tags:[]},
{lid:'4',product:'coffee', done:false, tags:[]},
{lid:'4',product:'brown sugar', done:false, tags:[]},
{lid:'4',product:'bacon', done:false, tags:[]},
{lid:'1',product:'apples', done:false, tags:[]},
{lid:'5',product:'2x4-8\'', done:false, tags:[]},
{lid:'0',product:'brown gravy', done:true, tags:[]},
{lid:'0',product:'bags', done:true, tags:[]},
{lid:'0',product:'applesauce', done:true, tags:[]},
{lid:'00',product:'sugar', done:true, tags:[]},
{lid:'0',product:'baby back ribs', done:true, tags:[]},
{lid:'1',product:'brown gravy', done:true, tags:[]},
{lid:'7',product:'bags', done:true, tags:[]},
{lid:'7',product:'applesauce', done:true},
{lid:'4',product:'sugar', done:true, tags:[]},
{lid:'1',product:'baby back ribs', done:true, tags:[]},
{lid:'4',product:'apple butter', done:true, tags:[]}
];

var lists =[];
lists.name = 'lists';
lists.items = [
{lid:'Jutebi', shops:'groceries', timestamp:1395763172175, list:[
    {product:'banana', done:false, tags:[], amt:{}},
    {product:'coffee', done:false, tags:[], amt:{}},
    {product:'apples', done:true, tags:['produce'], amt:{qty:3, unit:'3lb bag'}},
    {product:'milk', done:false, tags:['orgainic', 'dairy'], amt:{qty:1,unit:'1/2 gal'}},
    {product:'butter', done:false, tags:[], amt:{}},
    {product:'teff flour', done:true, tags:[], amt:{}}], 
      stores:[{id:'s_Bereti', name: 'Stop&Shop'}]},
{lid:'Guvupa', shops:'groceries', timestamp:1395763172175},
{lid:'Kidoju', shops:'hardware', timestamp:1395763172175},
{lid:'Woduvu', shops:'drugs', timestamp:1395763172175},
];

var users = [];
users.name = 'users';
users.items= [
{name: 'tim', email: 'mckenna.tim@gmail.com', lists:[], role:'admin', timestamp:1399208688, apikey:'Natacitipavuwunexelisaci'},
{name: 'tim7', email: 'mckenna.tim@gmail.com', lists:[], role:'user', timestamp:1399208688, apikey:'Qemavohegoburuxosuqujoga' },
{name: 'peri', email: 'perimckenna@gmail.com', lists:[], role:'user', timestamp:1399208688, apikey: 'Piyopagibatinohovixekadi'},
{name: 'tim2', email: 'mckt_jp@yahoo.com', lists:[], role:'user', timestamp:1399208688, apikiey: 'Sobeqosevewacokejufozeki'}
];
