
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../index');
const Post = require('../models/posts');
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

describe('API Tests', () => {
    let authToken;
    let user;

    beforeEach(async () => {
        await User.deleteMany();
        await Post.deleteMany();
    });
    beforeEach((done) => {
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
                res.body.should.have.property('name');
                user = res.body; // Store the created user object
                done();
            });
    });

    before((done) => {

        chai.request(app)
            .post('/api/authenticate')
            .send({
                email: 'johndoe@example.com',
                password: 'password123',
            })
            .end((err, res) => {
                authToken = res.body.token;
                done(err);
            });
    });

    beforeEach(async () => {
        await Post.deleteMany();
    });

    describe('POST /api/posts/', () => {
        it('should create a new post', (done) => {
            const newPost = {
                title: 'Test Post 2',
                description: 'This is a test post',
            };

            chai.request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newPost)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('id');
                    done(err);
                });
        });
    });
    describe('POST /api/posts', () => {
        it('should not create a post with an empty title', (done) => {
            const newPost = {
                title: '',
                description: 'This is a test post',
            };

            chai.request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newPost)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('message').equal('Title is required');
                    done();
                });
        });

        it('should not create a post without a title', (done) => {
            const newPost = {
                description: 'This is a test post',
            };

            chai.request(app)
                .post('/api/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(newPost)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('message').equal('Title is required');
                    done();
                });
        });
    });
    describe('POST /api/all_posts/', () => {
        it('get all posts of loggedin user', (done) => {
            chai.request(app)
                .get('/api/all_posts')
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('posts');
                    done(err);
                });
        });
    });
});