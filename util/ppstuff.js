var users = [
    {id:1, user: 'tim', apikey: '1234567', email: 'mckenna.tim@gmail.com', role:'admin'}
  , {id:2, user: 'joe', apikey: 'birthday', email: 'joe@example.com', role:'user'}
];  

exports.findById = function(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}
exports.findByUsername = function(user, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.user === user) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}
exports.findByApiKey = function(apikey, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.apikey === apikey) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}
exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/api/unauthorized')
}