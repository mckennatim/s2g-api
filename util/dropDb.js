var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/stuffTest', function(err, res){
  mongoose.connection.db.dropDatabase(function(err, res){
    mongoose.connection.close();  
  });
})
