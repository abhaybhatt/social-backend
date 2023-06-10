
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../index')
const User = require('../models/user');


chai.use(chaiHttp);
chai.should();

before((done) => {
    mongoose.connect(process.env.DATABASE_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log('Connected to the test database');
            done();
        })
        .catch((err) => {
            console.error('Error connecting to the test database:', err);
            done(err);
        });
});


after((done) => {
    mongoose.connection.close()
        .then(() => {
            console.log('Disconnected from the test database');
            done();
        })
        .catch((err) => {
            console.error('Error disconnecting from the test database:', err);
            done(err);
        });
});

describe('Authentication Tests', () => {
    beforeEach(async () => {
        await User.deleteMany();
    });

    describe('POST /api/authenticate', () => {
        it('should register a new user', (done) => {
            const newUser = {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'password123',
            };

            chai.request(app)
                .post('/api/authenticate/signup')
                .send(newUser)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an('object');
                    res.body.should.have.property('name').equal(newUser.name);
                    res.body.should.have.property('email').equal(newUser.email);
                    done();
                });
        });
    });


    describe('POST /api/authenticate', () => {
        beforeEach(async () => {
            const newUser = {
                name: 'John Doe 2',
                email: 'johndoe2@example.com',
                password: 'password123',
            };

            await User.create(newUser);
        });

        it('should authenticate and return a token for valid credentials', (done) => {
            const credentials = {
                email: 'johndoe2@example.com',
                password: 'password123',
            };

            chai.request(app)
                .post('/api/authenticate')
                .send(credentials)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('token');
                    done();
                });
        });

        it('should return an error for invalid credentials', (done) => {
            const credentials = {
                email: 'johndoe2@example.com',
                password: 'password123asd',
            };

            chai.request(app)
                .post('/api/authenticate')
                .send(credentials)
                .end((err, res) => {
                    console.log('sssss', res.body)
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').equal('Incorrect Password');
                    done();
                });
        });
    });
});
