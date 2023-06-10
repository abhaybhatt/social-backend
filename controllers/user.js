const User = require("../models/user");
const Post = require("../models/posts");
const { validationResult } = require("express-validator");

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
exports.getUserById = async (req, res, next, id) => {
    User.findById(id).then((user, err) => {
        if (err || !user) {
            return res.status(400).json({
                error: "No user was found in DB"
            });
        }
        req.profile = user;
        next();
    });
};

exports.follow = async (req, res) => {
    const { id } = req.params;
    const { userId: followerId } = req;

    try {

        const userToFollow = await User.findById(id);
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (!userToFollow.followers.includes(followerId)) {
            userToFollow.followers.push(followerId);
            await userToFollow.save();
        }

        const follower = await User.findById(followerId);
        console.log(follower)
        if (!follower.following.includes(id)) {
            follower.following.push(id);
            await follower.save();
        }

        res.json({ message: 'User followed successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.unfollow = async (req, res) => {
    const { id } = req.params;
    const { userId: followerId } = req;

    try {

        const userToUnfollow = await User.findById(id);
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }


        const followerIndex = userToUnfollow.followers.indexOf(followerId);
        if (followerIndex !== -1) {
            userToUnfollow.followers.splice(followerIndex, 1);
            await userToUnfollow.save();
        }


        const follower = await User.findById(followerId);
        const followingIndex = follower.following.indexOf(id);
        if (followingIndex !== -1) {
            follower.following.splice(followingIndex, 1);
            await follower.save();
        }

        res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.user = async (req, res) => {
    try {
        if (req.userId) {
            let user = await User.findById(req.userId)
            if (user) {
                return res.json({
                    name: user.name,
                    followers: user.followers.length,
                    following: user.following.length,
                });
            } else {
                return res.status(404).json({ message: 'User not found' });
            }

        }
    } catch (err) {
        return res.status(404).json({ message: 'User not found' });
    }
}

exports.like = async (req, res) => {
    const { id } = req.params;
    const { userId } = req;

    try {

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }


        if (post.likes.includes(userId)) {
            return res.status(400).json({ message: 'You have already liked this post' });
        }


        post.likes.push(userId);
        await post.save();

        res.json({ message: 'Post liked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.unlike = async (req, res) => {
    const { id } = req.params;
    const { userId } = req;

    try {

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }


        if (!post.likes.includes(userId)) {
            return res.status(400).json({ message: 'You have not liked this post' });
        }


        const userIndex = post.likes.indexOf(userId);
        post.likes.splice(userIndex, 1);
        await post.save();

        res.json({ message: 'Post unliked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.comment = async (req, res) => {
    const { id } = req.params;
    const { userId } = req;
    const { comment } = req.body;

    try {

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }


        const Comment = {
            text: comment,
            author: userId,
        };


        post.comments.push(Comment);
        await post.save();
        const commentId = post.comments[post.comments.length - 1]._id;
        res.json({ message: 'Comment added successfully', commentId });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}
