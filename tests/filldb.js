var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://localhost:27017/stuffTest', {safe:true})
db.collection('users').find().toArray(function  (err,result){
  console.log(result.length)
})

db.collection('users', {strict:true}, function(err, collection) {
    if (err) {
        console.log("The 'users' collection doesn't exist. Creating it with sample data...");
        populateDB(users);
    }
});

var populateDB = function(huh) {
    console.log("Populating database...");
    var name= huh.name;
    var coll= huh.items;
    db.collection(name, function(err, collection) {
        collection.insert(coll, {safe:true}, function(err, result) {
          console.log(result.length);
        });
    });
}; 

var users = [];
users.name = 'users';
users.items= [
{name: 'tim', email: 'mckenna.tim@gmail.com', lists:[]},
{name: 'peri', email: 'perimckenna@gmail.com', lists:[]},
{name: 'tim2', email: 'mckt_jp@yahoo.com', lists:[]}
];




