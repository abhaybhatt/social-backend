require('dotenv').config();
const mongoose = require("mongoose")
const express = require("express")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const morgan = require("morgan")

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const postRoutes = require('./routes/posts')

const app = express()
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


app.use(morgan('combined'));
app.use("/api/authenticate", authRoutes);
app.use("/api/", userRoutes);
app.use("/api/posts/", postRoutes);

const port = process.env.PORT || 8000;



mongoose
    .connect(process.env.DATABASE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("DB CONNECTED");
    });


app.listen(port, () => {
    console.log(`app running at ${port}`)
});

module.exports = app;