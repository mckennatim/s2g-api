var SERVER_PORT = 3000;

var express = require('express')
var http = require('http')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var methodOverride =require('method-override')
var logger = require('morgan')
var session = require('express-session')
var nodemailer = require('nodemailer')
var myut = require('./util/myutil')
var gmailCred =require('./util/config').gmail();
var jwt = require('jwt-simple');
var secret = 'mambibi catches birds';
var passport = require('passport')
//var ppstuff = require('./util/ppstuff2')
//var util = require('util')
var LocalStrategy = require('passport-localapikey').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var _ = require('underscore');
/*--------------------------------setup db-------------------------------------------*/
var MongoClient = require('mongodb').MongoClient
var Server = require('mongodb').Server
var db
//to translate mongo id string to mongo _id
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('./util/myutil.js')
var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
        db = mongoClient.db("stuffDb");
        db.collection('users', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'users' collection doesn't exist. Creating it with sample data...");
                myut.populateDB(db, myut.inidata.users);
                db.collection('users', function(err, collection) {
                    collection.ensureIndex({name:1},{unique:true}, function(err, saved) {
                            //console.log(err);
                    });
                    collection.ensureIndex({id:-1},{unique:true}, function(err, saved) {
                            //console.log(err);
                    });          
                });
            };
        });  
        //console.log(db)
        db.collection('lists', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'lists' collection doesn't exist. Creating it with sample data...");
                myut.populateDB(db, myut.inidata.lists);
                db.collection('lists', function(err, collection) {
                    collection.ensureIndex({lid:1}, function(err, saved) {
                            //console.log(err);
                    });
                });        
            }
        });   
}); 
/*-----------------------------setup mailer-----------------------------------*/
var smtpTransport = nodemailer.createTransport("SMTP",gmailCred);  
console.log(smtpTransport.options.service)

/*---------------------------------PASSPORT stuff ------------------------------------*/


findById = function(id, fn) {
    db.collection('users', function(err, collection) {
        collection.findOne({id:id},function(err, items) {
            console.log(items);
            if (items) {
                fn(null, items);
            } else {
                fn(new Error('User ' + id + ' does not exist'));
            }      
        });
    });
}
findByUsername = function(name, fn) {
    db.collection('users', function(err, collection) {
        collection.findOne({name:name},function(err, items) {
            console.log(items);
            if (items.name === name) {
                return fn(null, items);
            } 
            return fn(null, null); 
        });
    });
}
findByToken = function(token, fn) {
        if (token) {
                try {
                        var user = jwt.decode(token, secret);  
                        var name = user.name;
                        db.collection('users', function(err, collection) {
                                collection.findOne({name:name},function(err, items) {
                                        //console.log(items);
                                        if (items.name === name) {
                                                return fn(null, items);
                                        } 
                                        return fn(null, null); 
                                });
                        }); 
                } catch (err) {
                        //console.log(err)
                        return fn(err, null); 
                }
        } 
}

findByApiKey = function(apikey, fn) {
    //console.log(apikey)
    db.collection('users', function(err, collection) {
        collection.findOne({apikey:apikey},function(err, items) {
            //console.log(items);
            if (items==null){
                return fn(null, null); 
            } else if (items.apikey === apikey) {
                return fn(null, items);
            } 
            return fn(null, null);       
        });
    });
}
ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) { 
        return next(); 
    }
    res.redirect('/api/unauthorized')
}
/*--------------------------------UTILITY stuff ------------------------------------*/
var blankUser= {name: '', email: '', lists:[], role:'', timestamp: 1, apikey: ''};

emailKey =function(items, callback){
    console.log('in emailKey')
    console.log(smtpTransport.options.service)
    var mailOptions = {
        from: "Stuff2Get <mckenna.tim@gmail.com>", // sender address
        to: items.email, // list of receivers
        subject: "apikey", // Subject line
        text: "Your apikey for stuff2get is: " +items.apikey + "Return to the web page and enter your apikey to complete registration for your device", // plaintext body
        html: "<b>Your apikey for stuff2get is: " +items.apikey + "</b><p>Return to the web page and enter your apikey to complete registration for your device </b></p>" // html body
    }
    var ret=""
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
                console.log(error);
                ret = error;
        }else{
                console.log("Message sent: " + response.message);
                ret = {message: 'check your email and come back'} 
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
        console.log(ret)
        callback(ret);
    });

}
makeKey= function(){
    return myut.createRandomWord(24);
}
createUser=function(usr, res, callback){
    var usr = usr;
    console.log('in createUser')
    console.log(usr)
    usr.timestamp=Date.now();
    if (usr.apikey.length < 10){
        usr.apikey=makeKey();
        console.log('creating new user with apikiey')
    } 
    //res.header("Access-Control-Allow-Origin", "10.0.1.24");
    //res.header("Access-Control-Allow-Credentials", true);
    //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
    console.log('just set headers')
    db.collection('users', function(err, collection) {
        collection.aggregate([{$group: {_id:0, maxid: {$max:"$id"}}}], function(err, result){
            var id = result[0].maxid+1;
            usr.id=id;
            console.log(usr)
            console.log('right before insert')
            var ret ={};
            collection.insert(usr, function(err, saved) {
                if(err){
                    console.log(err)
                    ret = err;
                }else{
                    console.log(saved)
                    console.log('right after insert')
                    ret = saved;
                };
                callback(ret);
            });
        });
    });     
}
updateUser=function(usr, res, callback){
    console.log('in updateUser');
    usr.timestamp=Date.now();
    if (usr.apikey.length < 10){
        usr.apikey=makeKey();
        console.log('creating new key and emailing it')
    } 
    //res.header("Access-Control-Allow-Origin", "*");
    //res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
    db.collection('users', function(err, collection) {
        collection.update({name: usr.name}, {$set:{email:usr.email, apikey: usr.apikey, timestamp:usr.timestamp}}, function(err, saved) {
        if(err){
            console.log(err)
            ret = err;
        }else{
            console.log(saved)
            console.log('right after update')
            ret = saved;
        };
        callback(ret);
        });
    });     
}

var isRightList = function(lists, list){
        return _.find(lists, function(obj) { return obj.lid == list })
}

/*-----------------------------setup passport-----------------------------------*/

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
        //console.log(user)
    });
});

passport.use(new LocalStrategy(
    function(apikey, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            findByApiKey(apikey, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown api ' + apikey }); }
                if (user.apikey!=apikey) { return done(null, false, { message: 'wrong apikey' }); }
                return done(null, user);
            })
        });
    }
)); 

passport.use(new BearerStrategy({
    },
    function(token, done) {
        // asynchronous validation, for effect...
        process.nextTick(function () {     
            // Find the user by token.  If there is no user with the given token, set
            // the user to `false` to indicate failure.  Otherwise, return the
            // authenticated `user`.  Note that in a production-ready application, one
            // would want to validate the token for authenticity.
            findByToken(token, function(err, user) {
                if (err) {
                        //console.log(err)
                        return done(err); 
                }
                if (!user) { return done(null, false); }
                return done(null, user);
            })
        });
    }
));
/*-----------------------------setup app-----------------------------------*/
var app = express();
//app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(logger());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(session({ secret: 'keyboard cat',saveUninitialized: true, resave: true}));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    //app.use(app.router);
    app.use(express.static(__dirname + '/../../public'));
//});
app.all('*', function(req,res,next){
    var htt= req.headers.origin;
    res.header("Access-Control-Allow-Origin", htt);
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-xsrf-token, Authorization");
    next();
});


app.get('/api/', function(req, res) {
    res.jsonp('please select a collection, lists, users or items')
});

/*-----------------------------setup auth-----------------------------------*/

//curl -v -d "apikey=1234567" http://127.0.0.1:3000/api/authenticate -c cookies.txt
//curl -c cookies.txt -b cookies.txt -G http://127.0.0.1:3000/api/account
//node_modules/vows/bin/vows  test/strategy-spec.js  --spec
app.post('/api/authenticate/:name', 
    //passport.authenticate('localapikey', {session: false, failureRedirect: '/api/unauthorized'}),
    passport.authenticate('localapikey', {session: false}),
    function(req, res) {
        console.log(req.params)
        console.log('just sent body in /api/authenticate')
        if (req.params.name==req.user.name){
            var payload = {name: req.user.name};
            var token = jwt.encode(payload, secret);
            var name =jwt.decode(token, secret);
            console.log(name)
            res.jsonp({token: token});
            console.log(token);     
        }else {
            res.jsonp({message: 'apikey does not match user'});
        }
    });

app.get('/api/account', 
    passport.authenticate('bearer', { session: false }), 
    function(req, res){ 
        console.log('in api/account ') 
        console.log(req.body)
        res.jsonp(req.user)
});

app.get('/api/unauthorized', function(req, res){
    req.logout();
    res.jsonp({ message: "Authentication Error" })
});
/*-----------------------------user routes-----------------------------------*/
app.get('/api/users', function(req, res) {
        console.log('in findLists');
        myut.find(db, 'users', res);
});
app.post('/api/users', function(req, res){//POST=Create
    console.log('in post new User');
    console.log(req.body);
    var user= req.body;
    createUser(user, res, function(retv){
        res.jsonp(retv);
    });
}); 
app.delete('/api/users/:name', function(req, res){
    console.log('in delete user by name');
    console.log(req.params);
    var name = req.params.name;
    db.collection('users', function(err, collection) {
        collection.remove({name:name}, function(err, saved) {
            if(err){
                res.jsonp(err)
            }else{
                res.jsonp(saved)};
        });
    });      
});
app.get('/api/users/:name', function(req, res) {
        console.log('in find user by name');
        console.log(req.params);
        var name = req.params.name;
        db.collection('users', function(err, collection) {
                collection.findOne({name:name},function(err, items) {
                        console.log(items);
                        res.jsonp(items);
                });
        });
});
app.get('/api/users/id/:id', function(req, res) {
        console.log('XXXXXXXXXXXXX in find user by id');
        console.log(req.params);
        var id = parseInt(req.params.id);
        db.collection('users', function(err, collection) {
            collection.findOne({id:id},function(err, items) {
                console.log(items);
                res.jsonp(items);
            });
        });
});
app.get('/api/users/apikey/:apikey', function(req, res) {
        console.log('in find user by apikey');
        console.log(req.params);
        var apikey = req.params.apikey;
        db.collection('users', function(err, collection) {
            collection.findOne({apikey:apikey},function(err, items) {
                console.log(items);
                res.jsonp(items);
            });
        });
});
app.get('/api/isUser/:name', function(req, res) {
        console.log('in isUser by name');
        var name = req.params.name.toLowerCase();
        console.log(name)
        db.collection('users', function(err, collection) {
                collection.findOne({name:name},function(err, items) {
                    console.log(items)            
                        if(items != null && items.name==name){
                            console.log('is registered')
                            res.jsonp({message: ' already registered'})
                        } else {
                            res.jsonp({message: ' available'});
                        }           
                });
        });
});
app.get('/api/isMatch/', function(req, res) {
    console.log('in isMatch');
    var name= req.query.user.toLowerCase();
    var email= req.query.email.toLowerCase();
    var apikey ="";
    console.log(name +' ' +email)
    var usr ={}
    db.collection('users', function(err, collection) {
        var andLen =0;
        var orLen=0;
        collection.find({name:name, email:email}).toArray(function(err, user) {
            if (user.length>0){
                usr=user[0];
            }      
            console.log(user)  
            console.log(user.length)
            andLen = user.length
            collection.find({$or: [{name:name}, {email:email}]}).toArray(function(err, oitems) {
                console.log(oitems)  
                console.log(oitems.length)
                orLen = oitems.length
                if (andLen+orLen==0){
                    //res.jsonp({message: 'available'});
                    console.log('available') 
                    var user = blankUser;
                    user.name = name;
                    user.email=email;
                    createUser(user, res, function(retv){
                        console.log('in callback')
                        console.log(retv)
                        emailKey(retv[0], function(ret){
                            console.log(ret);
                        });
                        res.jsonp({message:'available', userRec:'created', email:'sent'});
                    });                 
                } else if(andLen==1 & orLen==1){                
                    console.log('match') 
                    console.log(usr)
                    updateUser(usr, res, function(retv){
                        emailKey(usr, function(ret){
                            console.log(ret);
                        });
                        res.jsonp({message: 'match'});   
                    });                 
                } else {
                    res.jsonp({message: 'conflict'});                   
                    console.log('conflict')                   
                }             
            });        
        }); 
    });    
});
app.get('/api/emailKey/:name', function(req, res) {
    console.log('in emailKey by name');
    //console.log(smtpTransport.options.service)
    var name = req.params.name;
    db.collection('users', function(err, collection) {
        collection.findOne({name:name},function(err, items) {
            //console.log(items);
            //console.log(smtpTransport.options.service)
            emailKey(items, function(ret){
                res.jsonp(ret);
            });
        });
    });
});
// app.put('/api/users/:name/:lid', function(req, res){
//     console.log('in addList2user');
//     var name =req.params.name; 
//     var lid =req.params.lid;
//     var shopName;
//     //var ObjectId = require('mongoose').Types.ObjectId;
//     db.collection('lists', function(err, collection) {
//         collection.findOne({lid:lid}, function(err, alist) {
//             if(err){
//                 res.jsonp(err);
//             }else if (alist==null){
//                 res.jsonp("null list with that lid");
//             } else {
//                 shopName=alist.shops
//                 db.collection('users', function(err, collection) {
//                     collection.find({name:name},{lists:{$elemMatch:{lid:lid}}}).toArray(function(err,userLid){
//                         //console.log(userLid[0].lists==undefined)
//                         console.log(userLid)
//                         if(userLid.length==0){
//                             res.jsonp('user doesnt exist');
//                         } else if (err){
//                             ret.jsonp(err)
//                         }else if(userLid[0].lists!=undefined){
//                             console.log('!undefined-list already included');
//                             res.jsonp('list already included');
//                         }else{
//                             collection.find({name:name},{lists:{$elemMatch:{shops:shopName}}}).toArray(function(err,userName){
//                                 console.log(userName);
//                                 if(userName[0].lists!=undefined){
//                                     console.log('!undefined-name taken, choose another');
//                                     res.jsonp('name taken, choose another');
//                                 }else{
//                                     var ulist = {lid:alist.lid, shops:alist.shops}
//                                     collection.update({name:name},{$push:{lists:ulist}}, {upsert:false}, function(err, saved) {
//                                         if(err){res.jsonp(err)}else{
//                                             console.log('adding this list')
//                                             res.jsonp(ulist)};
//                                     });
//                                 }
//                             });
//                         }                                      
//                     });
//                 });       
//             }
//         });
//     });
// });//PUT=Update
/*--------------------------------LIST routes----------------------------------------*/

app.get('/api/lists', function(req, res) {
        console.log('in findLists');
        myut.find(db, 'lists', res);
});

app.get('/api/lists/:lid', 
        passport.authenticate('bearer', { session: false }), 
        function(req, res){ 
                console.log('in getList by lid');
                var lid = req.params.lid;
                console.log(lid);              
                console.log(req.user);             
                if (isRightList(req.user.lists, lid)) {
                        db.collection('lists', function(err, collection) {
                                collection.findOne({lid:lid}, function(err, items) {
                                        if(err){res.jsonp(err)}else{
                                            console.log('this got found')
                                            console.log(items.shops)
                                            res.jsonp(items)
                                        };
                                })
                        })      
                } else {
                        res.jsonp({message: 'that is not one of your lists', lists: req.user.lists})
                }
        }
)

app.post('/api/lists/:shops',         
    passport.authenticate('bearer', { session: false }), 
    function(req, res){ 
        console.log('in createList w shops');
        console.log(req.params.shops);
        var user =req.user
        var name = user.name;
        var shops = req.params.shops;
        var lid = myut.createRandomWord(6)
        var body= {lid: lid, shops:shops, stores: [], timestamp:Date.now(), items:[], users: [name]} 
        console.log(body);
        db.collection('users', function(err, collection) {         
            collection.find({name:name}, {lists:{$elemMatch:{shops:shops}}}).toArray(function(err,userData){
                console.log(userData);
                if(userData[0].lists!=undefined){
                    console.log('!undefined-name taken, choose another');
                    res.jsonp('name taken, choose another');
                }else{
                    var ulist = {lid:lid, shops:shops}
                    collection.update({name:name},{$push:{lists:ulist}}, {upsert:false}, function(err, saved) {
                        if(err){res.jsonp(err)}
                        else{
                            console.log('adding this list to users')
                            db.collection('lists', function(err, collection) {
                                collection.insert(body, function(err,saved){
                                    if(err){res.jsonp(err)}
                                    else{
                                        console.log('adding this list to lists')
                                        res.jsonp(ulist);                        
                                    }
                                });
                            });    
                        };
                    });
                }
            });
        });
})

app.delete('/api/lists/:lid',         
    passport.authenticate('bearer', { session: false }), 
    function(req, res){ 
        console.log('in delete list by lid');
        console.log(req.params);
        var lid = req.params.lid;
        var user = req.user;
        db.collection('lists', function(err, collection) {
            collection.update({lid:lid},{$pull:{users:user.name}}, {upsert:false}, function(err, saved) {
                if(err){res.jsonp(err)}else{
                    collection.remove({users:{$size:0}}, function(err, saved) {
                        if(err){res.jsonp(err)};
                    });
                    db.collection('users', function(err, collection) {
                        collection.update({name:user.name},{$pull:{lists:{lid:lid}}}, {multi:true}, function(err, saved) {
                            if(err){res.jsonp(err)}else{
                            	collection.findOne({name:user.name},function(err, items) {
                            		if(err){res.jsonp(err)}else{
                            			console.log(items)
	                                	res.jsonp(items);
	                               }
                               });
                            }
                        });                     
                    });
                };
            });
        });      
})
app.put('/api/lists/:lid',
        passport.authenticate('bearer', { session: false }), 
        function(req, res){ 
                console.log('XXXXX in update list/:lid');
                var body=req.body;
                var lid = req.params.lid;
                if (isRightList(req.user.lists, lid)) { 
                        db.collection('lists', function(err, collection) {
                                collection.update({lid:lid},{$set:body},function(err, items) {
                                        console.log(items);
                                        res.jsonp(items);
                                });
                        });
                } else {
                        res.jsonp({message: 'that is not one of your lists', lists: req.user.lists})
                }
        }
)
app.put('/api/users/:name',
    passport.authenticate('bearer', { session: false }), 
    function(req, res){ 
        console.log('XXXXX in update users/name');
        var body=req.body;
        delete body._id;
        console.log(body)
        var name = req.params.name;
        db.collection('users', function(err, collection) {
            collection.update({name:name},body, function(err, items) {
                console.log(items);
                res.jsonp(items);
            });
        });
    }
)
app.put('/api/user/:lid',
    passport.authenticate('bearer', { session: false }), 
    function(req, res){ 
        var shops, list;
        console.log('in PUT api/user/lid ');
        var user = req.user;
        var lid = req.params.lid;
        db.collection('lists', function(err, collection) {
            collection.findOne({lid:lid},function(err,items){
                if(err){res.jsonp(err)}else{
                    if(!items){
                        res.jsonp({message: 'that list doesnt exist'})
                    }else{
                        shops=items.shops;
                        collection.update({lid:lid},{$addToSet:{users:user.name}}, function(err, items) {
                            if(err){res.jsonp(err)}else{                        
                                list={lid:lid, shops:shops}
                                db.collection('users', function(err, collection) {
                                    collection.update({name:user.name},{$push:{lists:list}}, function(err,items){
                                        if(err){res.jsonp(err)}else{
                                            console.log(list)
                                            res.jsonp(list);
                                        }
                                    });
                                });   
                            }
                        });                                                             
                    }
                }
            });
        });
    }
)
var server = http.createServer(app);
var io = require('socket.io')(server);
server.listen(SERVER_PORT, function(){
    console.log('Express server listening on port ' + SERVER_PORT);
});
var clients = [];
var cnt = 0
io.on('connection', function(ws) {
    console.log('somebody connected')
    ws.on('switchLid', function (lid) {
        console.log(ws.rooms[0])
        ws.leave(ws.rooms[0])               
        console.log('joined: '+lid) 
        ws.join(lid, function(){
            console.log(ws.rooms)
        });
        
    });
    ws.on('message', function incoming(message){
        console.log(message)
                           console.log(ws.rooms) 
        ws.broadcast.to(ws.rooms[0]).emit('itemChanged', message)
    })
});

