const User = require("../models/user");
const { validationResult } = require("express-validator");
var jsonwebtoken = require("jsonwebtoken");
var { expressjwt: jwt } = require("express-jwt");

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                message: errors.array()[0].msg,
                data: null,
                status: "fail"
            });
        }
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                status: "fail",
                data: null,
                message: "Email already in use"
            })
        }
        user = new User(req.body);
        await user.save()
        return res.status(200).json({
            name: user.name,
            email: user.email,
            id: user._id,
        });
    } catch (err) {
        console.log(err)
        return res.status(422).json({
            status: "fail",
            data: null,
            message: err
        });
    }

};
exports.signin = async (req, res) => {
    const errors = validationResult(req);
    const { email, password } = req.body;

    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.array()[0].msg,
            data: null,
            status: "fail"
        });
    }

    //checking email is registered or not
    let user = await User.findOne({ email }).then(function (user, err) {
        if (err || !user) {
            return res.status(400).json({
                error: "This email is not registered",
            });
        }
        //checking password is correct or not
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: "Incorrect Password",
            });
        }

        //creating token
        var token = jsonwebtoken.sign({ _id: user._id }, process.env.SECRET);

        //putting token in cokkie
        res.cookie("token", token, { expire: new Date() } + 9999);

        //send response to frontend

        const { _id, name, email, role } = user;
        return res.json({ token });
    });


};

exports.signout = (req, res) => {
    //CLEAR COOKIE
    res.clearCookie("token");
    res.json({
        message: "User signout",
    });
};


exports.isAuthenticated = async (req, res, next) => {
    try {
        // Check if the user is authenticated
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jsonwebtoken.verify(token, process.env.SECRET);
        req.userId = decoded._id;
        next();
    } catch (error) {
        console.log(err)
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};


