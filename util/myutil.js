
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
 {
    "lid": "Jutebi",
    "shops": "groceries",
    "timestamp": 1410019842776,
    "items": [
      {
        "product": "butter",
        "done": false,
        "tags": [],
        "amt": {
          "qty": ""
        },
        "loc": "dairy"
      },
      {
        "product": "coffee",
        "done": false,
        "tags": [],
        "amt": {
          "qty": ""
        },
        "loc": "coffee/tea"
      },
      {
        "product": "milk",
        "done": false,
        "tags": [
          "orgainic",
          "dairy"
        ],
        "amt": {
          "qty": "2",
          "unit": "1/2 gal"
        },
        "loc": "dairy"
      },
      {
        "product": "frog legs",
        "done": false,
        "amt": {
          "qty": "3"
        },
        "loc": "meats"
      },
      {
        "product": "apples",
        "done": false,
        "tags": [
          "produce"
        ],
        "amt": {
          "qty": "2",
          "unit": "3lb bag"
        },
        "loc": "produce"
      },
      {
        "product": "seltzer",
        "done": true,
        "amt": {
          "qty": "4"
        },
        "loc": "snacks"
      },
      {
        "product": "banana",
        "done": true,
        "tags": [],
        "amt": {
          "qty": ""
        },
        "loc": "produce"
      },
      {
        "product": "cat food",
        "done": true,
        "amt": {
          "qty": ""
        },
        "loc": "pet"
      },
      {
        "product": "teff flour",
        "done": true,
        "tags": [],
        "amt": {},
        "loc": "baking"
      }
    ],
    "stores": [
      {
        "id": "s_Bereti",
        "name": "Stop&Shop",        
      },
      {
        "id": "s_Bereto",
        "name": "WholeFoods"        
      }
    ],
    "users": [
      "tim",
      "tim7"
    ]
  },
  {lid:'Guvupa', shops:'groceries', timestamp:1395763172175, items:[], users:[]},
  {
    "lid": "Kidoju",
    "shops": "hardware",
    "timestamp": 1409966611033,
    "items": [
      {
        "product": "12-2",
        "done": false
      },
      {
        "product": "pipe hangers",
        "done": true,
        "amt": {
          "qty": ""
        }
      },
      {
        "product": "fuzz balls",
        "done": true,
        "tags": [],
        "amt": {}
      }
    ],
    "users": [
      "tim"
    ],
    "stores": [
      {
        "id": "s_Cereti",
        "name": "HomeDepot"      
      },
      {
        "id": "s_Cereto",
        "name": "Ace"        
      }
    ],    
  },
  {
    "lid": "Woduvu",
    "shops": "drugs",
    "timestamp": 1395763172175,
    "items": [
      {
        "product": "dental floss",
        "done": true,
        "amt": {
          "qty": ""
        }
      },
      {
        "product": "hydrogen peroxide",
        "done": true,
        "tags": [],
        "amt": {}
      }        
    ],
    "users": [
        "tim7"
    ],
       "stores": [
      {
        "id": "s_Bereti",
        "name": "Stop&Shop",        
      },
      {
        "id": "s_Beretc",
        "name": "CVS"        
      }
    ],
  },
  {
    "lid": "Tamaki",
    "shops": "down center",
    "timestamp": 1410011606582,
    "items": [
      {
        "product": "coffee",
        "done": false
      }
    ],
    "users": [
      "tim"
    ]
  }
  ]},
 'users':{name:'users',items:[
  {
    "_id": "5409c803d7a626d671297331",
    "apikey": "Natacitipavuwunexelisaci",
    "defaultLid": "Kidoju",
    "email": "mckenna.tim@gmail.com",
    "id": 1,
    "lists": [
      {
        "lid": "Tamaki",
        "shops": "down center"
      },
      {
        "lid": "Jutebi",
        "shops": "groceries"
      },
      {
        "lid": "Kidoju",
        "shops": "hardware"
      }
    ],
    "name": "tim",
    "role": "admin",
    "timestamp": 1409936908725
  },
  {
    "_id": "5409ee0cc4cd771572c29335",
    "apikey": "Qemavohegoburuxosuqujoga",
    "defaultLid": "Jutebi",
    "email": "tim@sitebuilt.net",
    "id": 5,
    "lists": [
      {
        "lid": "Jutebi",
        "shops": "groceries"
      },
      {
        "lid": "Woduvu",
        "shops": "drugs"
      }
    ],
    "name": "tim7",
    "role": "user",
    "timestamp": 1410027284251
  },
  {id:3, name: 'peri', email: 'perimckenna@gmail.com', defaultList: 0, lists:[], role:'user', timestamp:1399208688, apikey: 'Piyopagibatinohovixekadi'},
  {id:4, name: 'tim2', email: 'mckt_jp@yahoo.com', defaultList: 0, lists:[], role:'user', timestamp:1399208688, apikey: 'Sobeqosevewacokejufozeki'}
  ]}
}

