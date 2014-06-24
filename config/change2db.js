fs = require('fs')

exports.change2db = function () {
  var path = arguments[0];
  var fname = arguments[1];
  fs.readFile(arguments[0] + arguments[1]+'.txt', 'utf8', function (err, data) {
    if (err) throw err;
    console.log('changing to ' + path + fname + ' database');
    fs.writeFile(path +'dbConfig.js', data, function (err) {
      if (err) return console.log(err);
      console.log('supposedly wrote');
      console.log(data);
    });
  });
};