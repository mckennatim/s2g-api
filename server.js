var express = require('express')
stuff = require('./routes/stuff')

var passport = require('passport')
var ppstuff = require('./util/ppstuff')
var util = require('util')
var LocalStrategy = require('passport-localapikey').Strategy;

var dog = 'butler';


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  ppstuff.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(apikey, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      ppstuff.findByApiKey(apikey, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown api ' + apikey }); }
        if (user.apikey!=apikey) { return done(null, false, { message: 'apikey' }); }
        return done(null, user);
      })
    });
  }
)); 

var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});

app.all('*', function(req,res,next){
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-xsrf-token");
  next();
});


app.get('/api/', function(req, res) {
  res.jsonp('please select a collection, lists, users or items')
});


app.get('/api/users', stuff.findUsers);
app.post('/api/users', stuff.createUser); //POST=Create
app.del('/api/users/:name', stuff.deleteUser);
app.get('/api/users/:name', stuff.findUserByName);
app.put('/api/users/:name/:lid', stuff.addList2user);//PUT=Update

app.get('/api/lists', stuff.findLists);
app.get('/api/lists/:lid', stuff.getList)
app.post('/api/lists/:shops', stuff.createList)
app.del('/api/lists/:lid', stuff.deleteList)
app.put('/api/lists/:lid', stuff.updateList)

app.get('/api/account', ppstuff.ensureAuthenticated, function(req, res){  
  res.jsonp(req.user)
});

app.get('/api/unauthorized', function(req, res){
  req.logout();
  res.jsonp({ message: "Authentication Error" })
});

//curl -v -d "apikey=1234567" http://127.0.0.1:3000/api/authenticate -c cookies.txt
//curl -c cookies.txt -b cookies.txt -G http://127.0.0.1:3000/api/account
//node_modules/vows/bin/vows  test/strategy-spec.js  --spec

app.post('/api/authenticate', 
  passport.authenticate('localapikey', { failureRedirect: '/api/unauthorized'}),
  function(req, res) {
     res.jsonp(req.user)
  });


app.listen(3000);
console.log('listening on port 3000');

