const express = require('express');
const router = express.Router();
const { isAuthenticated, signout } = require("../controllers/auth");
const { follow, unfollow, like, unlike, comment, user } = require("../controllers/user");
const { getAllPosts } = require("../controllers/posts")
const { check } = require('express-validator');

// router.param("id", getUserById);
router.post("/follow/:id", isAuthenticated, follow);
router.post("/unfollow/:id", isAuthenticated, unfollow);
router.post("/like/:id", isAuthenticated, like);
router.post("/unlike/:id", isAuthenticated, unlike);
router.post("/comment/:id", isAuthenticated, comment);
router.get("/user", isAuthenticated, user);
router.get("/all_posts", isAuthenticated, getAllPosts);


// router.post("/", [
//     check("password").isLength({ min: 1 }).withMessage("password field can not be empty"),
//     check("email").isEmail().withMessage("Invalid email")
// ], signin);



router.get("/signout", signout);

module.exports = router;