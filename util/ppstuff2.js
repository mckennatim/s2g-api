
exports.findById = function(id, fn) {
  db.collection('users', function(err, collection) {
    collection.findOne({id:id},function(err, items) {
      console.log(items);
      res.jsonp(items);
    });
  });
  if (items) {
    fn(null, items);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}
exports.findByUsername = function(name, fn) {
  db.collection('users', function(err, collection) {
    collection.findOne({name:name},function(err, items) {
      console.log(items);
      res.jsonp(items);
    });
  });
  if (items.name === name) {
    return fn(null, items);
  } 
  return fn(null, null); 
}
exports.findByApiKey = function(apikey, fn) {
  db.collection('users', function(err, collection) {
    collection.findOne({apikey:apikey},function(err, items) {
      console.log(items);
      res.jsonp(items);
    });
  });
  if (items.apikey === apikey) {
    return fn(null, items);
  } 
  return fn(null, null); 
}
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/api/unauthorized')
}