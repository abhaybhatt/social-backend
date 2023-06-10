const express = require('express');
const router = express.Router();
const { isAuthenticated, signout } = require("../controllers/auth");

const { createPost, deletePost, getPost } = require('../controllers/posts');


router.post("/", isAuthenticated, createPost);
router.delete("/:id", isAuthenticated, deletePost);
router.get("/:id", getPost);



module.exports = router;