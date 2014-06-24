console.log("in stuff")
var mongoskin = require('mongoskin')
var db = mongoskin.db('mongodb://localhost:27017/stuffTest', {safe:true})
db.collection('users').find().toArray(function  (err,result){
  console.log(result.length)
})