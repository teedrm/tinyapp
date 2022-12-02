const { assert } = require('chai');

const { checkEmailAvailable } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkEmailAvailable', function() {
  it('should return a user with valid email', function() {
    const user = checkEmailAvailable("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert((user === expectedUserID), true)
  });

  it('return undefined if user does not exist', function() {
    const user = checkEmailAvailable("hello@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert(user === undefined);
  })
});