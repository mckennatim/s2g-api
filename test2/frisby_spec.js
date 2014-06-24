
var frisby = require('frisby');

var URL = 'http://localhost:3000';
var URL_AUTH = 'http://username:password@localhost:3000';

frisby.globalSetup({ // globalSetup is for ALL requests
  request: {
    headers: { 'X-Auth-Token': 'fa8426a0-8eaf-4d22-8e13-7c1b16a9370c' }
  }
});

frisby.create('GET user tim')
  .get(URL + '/users/tim')
  .expectStatus(200)
  .expectJSONTypes('0',{
    name: String,
    email: String,
    lists: Array
  })
  .expectJSON('0',{
    name: 'tim',
    email: 'mckenna.tim@gmail.com'
  })
  // 'afterJSON' automatically parses response body as JSON and passes it as an argument
  .afterJSON(function(user) {
    var name=user[0].name;
    expect(1+1).toEqual(2);

    // Use data from previous result in next test
    frisby.create('Update user')
      .put(URL + '/users/' +name +'/532894f9fec33ab4280107b9')
      .expectStatus(200)
    .toss();
  })
.toss();
