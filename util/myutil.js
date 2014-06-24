
exports.createRandomWord= function(length) {
  var consonants = 'bcdfghjklmnpqrstvwxyz',
    vowels = 'aeiou',
    rand = function(limit) {
      return Math.floor(Math.random()*limit);
    },
    i, word='', length = parseInt(length,10),
    consonants = consonants.split(''),
    vowels = vowels.split('');
  for (i=0;i<length/2;i++) {
    var randConsonant = consonants[rand(consonants.length)],
      randVowel = vowels[rand(vowels.length)];
    word += (i===0) ? randConsonant.toUpperCase() : randConsonant;
    word += i*2<length-1 ? randVowel : '';
  }
  return word;
}

/*------------------------------support functions----------------------------------*/
exports.find =function(db, na, res){
    db.collection(na, function(err, collection) {
        collection.find().toArray(function(err, items) {
            if(err){res.jsonp(err)}else{res.jsonp(items)};
        });
    });
};
exports.updListTimestamp=function(db,lid){
  console.log('in updListTimestamp')
  var timestamp = Date.now()
  console.log(timestamp) 
  db.collection('lists', function(err, collection) {
    collection.update({lid:lid},{$set:{timestamp:timestamp}},function(err, items) {
      console.log(items);
    });
  });
}
exports.getLidUpdTimestamp=function(db,pid, callback){
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

exports.populateDB = function(db, huh) {
    console.log("Populating database...");
    var name= huh.name;
    var coll= huh.items;
    db.collection(name, function(err, collection) {
        collection.insert(coll, {safe:true}, function(err, result) {});
        //console.log(result);
    });
};
exports.inidata={'lists':{name:'lists', items:[
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
  ]},
 'users':{name:'users',items:[
  {id:1, name: 'tim', email: 'mckenna.tim@gmail.com', defaultList: 0, 
    lists:[{
        "lid" : "Jutebi",
        "shops" : "groceries"
    }], role:'admin', timestamp:1399208688, apikey:'Natacitipavuwunexelisaci'},
  {id:2, name: 'tim7', email: 'mckenna.tim7@gmail.com', defaultList: 0, lists:[], role:'user', timestamp:1399208688, apikey:'Qemavohegoburuxosuqujoga' },
  {id:3, name: 'peri', email: 'perimckenna@gmail.com', defaultList: 0, lists:[], role:'user', timestamp:1399208688, apikey: 'Piyopagibatinohovixekadi'},
  {id:4, name: 'tim2', email: 'mckt_jp@yahoo.com', defaultList: 0, lists:[], role:'user', timestamp:1399208688, apikiey: 'Sobeqosevewacokejufozeki'}
  ]}
}

