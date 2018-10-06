var express = require('express');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var router = express.Router();

const User = require('../model/user');
const Token = require('../model/token');

//retrieving data from database
router.get('/users', (req, res, next) => {
    User.find((err, users) => {
        if(err) {
            res.json(err);
        } else {
            res.json(users);
        }
    });
});

//inserting new data
router.post('/register', (req, res, next)=>{
    //Make sure this account doesn't exist
    User.findOne({email: req.body.email}, (err, user) => {
        if (user) {
            res.status(400).json({msg: 'The email address you have entered already exists.'});
        } else {
            // Create and save new user
            let newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                status: req.body.status
            });
            newUser.save((err, user) => {
                if(err) {
                    res.json(err);
                } else {
                    // Create a verification token for this user
                    var token = new Token({
                        _userId: user._id,
                        token: crypto.randomBytes(16).toString('hex')
                    });

                    token.save((err) => {
                        if (err) {
                            res.json(err);
                        } else {
                            //send verification email
                            var mailer = nodemailer.createTransport({
                                service: 'Gmail',
                                auth: {
                                    user: 'lesok3333@gmail.com',
                                    pass: 'Creation12#222'
                                }
                            });
                            var mailOptions = {
                                from: 'no-reply@virtualapp.com',
                                to: req.body.email,
                                subject: 'Account Verification Token',
                                text: 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api\/verify\/' + token.token + '\n'
                            };
                            mailer.sendMail(mailOptions, (err) => {
                                if (err) {
                                    res.json(err);
                                } else {
                                    res.json({msg: 'Verification email has been sent.'});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

//verify user registration
router.get('/verify/:token', (req, res, next) => {
    // Find a matching token
    Token.findOne({token: req.params.token}, (err, token) => {
        if (!token) {
            res.status(400).send({type: 'not-verified', msg: 'We were unable to find a valid token. Your token might have expired.'});
        } else {
            // If we found a token, find a matching user
            User.findOne({_id: token._userId}, (err, user) => {
                if (!user) {
                    res.status(400).json({msg: 'We were unable to find a user for this token.'});
                } else {
                    if (user.isVerified) {
                        res.status(400).json({type: 'already-verified', msg: 'This user has been already verified.'});
                    } else {
                        // Verify and save the user
                        user.isVerified = true;
                        user.save((err) => {
                            if (err) {
                                res.json(err);
                            } else {
                                res.json({msg: 'The account has been verified. Please log in'});
                            }
                        });
                    }
                }
            });
        }
    });
});

// resend token
router.post('/resend', (req, res, next) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (!user) {
            res.status(400).json({msg: 'We were unable to find a user with that email.'});
        } else {
            if (user.isVerified) {
                res.status(400).json({msg: 'This account has been already verified.'});
            } else {
                var token = new Token({
                    _userId: user._id,
                    token: crypto.randomBytes(16).toString('hex')
                });

                token.save((err) => {
                    if (err) {
                        res.json(err);
                    } else {
                        // Send the email
                        var mailer = nodemailer.createTransport({
                            service: "Gmail",
                            auth: {
                                user: "lesok3333@gmail.com",
                                pass: "Creation12#222"
                            }
                        });
                        var mailOptions = {
                            from: 'no-reply@virtualapp.com',
                            to: req.body.email,
                            subject: 'Account Verification Token',
                            text: 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/api\/verify\/' + token.token + '\n'
                        };
                        mailer.sendMail(mailOptions, (err) => {
                            if (err) {
                                res.json(err);
                            } else {
                                res.json({msg: 'Verification email has been sent.'});
                            }
                        });
                    }
                })
            }
        }
    })
})

//update the data
router.put('/user/:id', (req, res, next)=>{
    User.findOneAndUpdate({_id: req.params.id}, {
        $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            status: req.body.status
        }
    }, (err, result) => {
        if(err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});

//deleting the data
router.delete('/user/:id', (req, res, next)=>{
    User.deleteOne({_id: req.params.id}, (err, result) => {
        if(err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
})

module.exports = router;
