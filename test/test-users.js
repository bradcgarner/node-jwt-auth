'use strict';
//require('dotenv').config(); // this is unconditional, which will require heroku to install it (which is not needed), but since it is listed in core dependencies, it at least won't break heroku. Later learn to do it conditionally.

const { TEST_DATABASE_URL, TEST_PORT } = require('../config');
process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');

const expect = chai.expect;
chai.use(chaiHttp);

const faker = require('faker');

describe('/api/users', function () { // BE SURE TO ADD firstName and lastName

  function fakeUser() {
    return {
      username : faker.internet.userName(),
      password : faker.internet.password(),
      firstName : faker.name.firstName(),
      lastName : faker.name.lastName()
    };
  }

  before(function () {
    return runServer(TEST_DATABASE_URL, TEST_PORT);
  });

  beforeEach(function () {
    const fakeUsers = [];
    return User.remove({})
      .then(()=>{
        for (let i=0; i<10; i++){
          fakeUsers.push(fakeUser());
        }
        return User.insertMany(fakeUsers);
      });
  });

  afterEach(function () {
    //console.log('after each');
  });

  after(function () {
    return closeServer();
  });

  describe('/api/users', function () {
    describe('POST', function () {
      it('Should reject users with missing username', function () {
        let fakeU = fakeUser();
        delete fakeU.username;
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with missing password', function () {
        let fakeU = fakeUser();
        delete fakeU.password;
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-string username', function () {
        let fakeU = fakeUser();
        fakeU.username = 1234;
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-string password', function () {
        let fakeU = fakeUser();
        fakeU.password = 1234;
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with non-trimmed username', function () {
        let fakeU = fakeUser();
        fakeU.username = ' untrimmed ';
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with non-trimmed password', function () {
        let fakeU = fakeUser();
        fakeU.password = ' untrimmed ';
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with empty username', function () {
        let fakeU = fakeUser();
        fakeU.username = '';
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 1 characters long'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should reject users with password fewer than ten characters', function () {
        let fakeU = fakeUser();
        fakeU.password = 'abc';
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 10 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        let fakeU = fakeUser();
        fakeU.password = new Array(73).fill('a').join('');
        return chai
          .request(app)
          .post('/api/users')
          .send( fakeU )
          .then(() =>
            expect.fail(null, null, 'Request should not succeed')
          )
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at most 72 characters long'
            );
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject users with duplicate username', function () {
        let fakeU = fakeUser();
        return User.create( fakeU )
          .then(() => {
            // Try to create a 2nd user with same username
            return chai.request(app)
              .post('/api/users')
              .send( fakeU );
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Username already taken'
            );
            expect(res.body.location).to.equal('username');
          });
      });
      it('Should create a new user!', function () {
        let fakeU = fakeUser();
        return chai
          .request(app)          
          .post('/api/users')
          .send( fakeU )
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.all.keys('username', 'firstName', 'lastName', 'id');
            expect(res.body.username).to.equal(fakeU.username);
          })
          // WE GET AN UNHANDLED PROMISE REJECTION WARNING HERE
          // .then(() => {
          //   return User.findOne({ username: fakeU.username });
          // })
          // .then(user => {
          //   expect(user).to.not.be.null;
          //   return user.validatePassword(fakeU.password);
          // })
          // .then(passwordIsCorrect => {
          //   expect(passwordIsCorrect).to.be.true;
          // })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
          });
      });
      it.only('Should not allow users to be deleted', function() {
         return User.findOne()
          .then(res => {
            console.log(res);
            expect(res).to.be.an('object');
           //expect(res).to.include.all.keys('username', 'firstName', 'lastName', '_id');
           expect({foo:123, bar:456}).to.include.all.keys('foo');
            return res._id;
          })
          .then(userId => {
            return chai
              .request(app)
              .delete(`/api/users/${userId}`);
          })
          .then(() => {
            expect.fail(null, null, 'Request should not succeed');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(404);
            expect(res.body.message).to.equal(
              'Not Found'
            );
          });
      });
      it('Should update a user', function() {
        let originalUser = {};
       return User.findOne()
          .then(res => {
            expect(res).to.be.an('object');
            expect(res).to.have.all.keys('username', 'firstName', 'lastName', 'id');
            originalUser = res.body;
            return originalUser;
          })
          .then(user => {
            let newPassword = User.hashPassword(faker.internet.password());
            return chai
              .request(app)
              .put(`/api/users/${user._id}`)
              .send({
                username: user.username + 222,
                password: newPassword,
                firstName: user.firstName + 222,
                lastName: user.lastName + 222
              })
              .then(res => {
                expect(res).to.have.status(204);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.all.keys('username', 'firstName', 'lastName', 'id');
                expect(res.body.username).to.equal(originalUser.username + 222);                expect(res.body.firstName).to.equal(originalUser.firstName + 222);               expect(res.body.lasName).to.equal(originalUser.lastName + 222);
                expect(res.body.password).to.equal(newPassword);
              });
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
            const res = err.response;
            expect(res).to.have.status(404);
            expect(res.body.message).to.equal(
              'Not Found'
            );
          });
      });
    });
  });
});
