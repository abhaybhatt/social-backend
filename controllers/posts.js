const Post = require("../models/posts")
const User = require("../models/user")


exports.createPost = async (req, res) => {
    const { userId } = req;
    const { title, description } = req.body;

    try {
        if (title === '') {
            return res.status(400).json({ message: 'Title is required' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
    try {
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }


    try {
        const post = new Post({
            title,
            description,
            author: userId,
        });


        await post.save();
        res.status(200).json({
            id: post._id,
            description: post.description,
            title: post.title,
            createdAt: post.createdAt
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deletePost = async (req, res) => {
    const { userId } = req
    const { id } = req.params;

    try {

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }


        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await post.deleteOne({ _id: id });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getPost = async (req, res) => {
    const { id } = req.params;

    try {

        const post = await Post.findById(id)
            .populate('author', 'name')
            .populate('likes', 'name')
            .populate('comments.author', 'name')

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }


        const likeCount = post.likes.length;
        const commentCount = post.comments.length;


        const postData = {
            _id: post._id,
            title: post.title,
            content: post.content,
            author: post.author,
            likes: post.likes,
            comments: post.comments,
            likeCount,
            commentCount,
        };

        res.json({ post: postData });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getAllPosts = async (req, res) => {
    const { userId } = req;

    try {

        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate('comments.author', 'name')
            .populate('likes', 'name');


        const formattedPosts = posts.map(post => {
            return {
                id: post._id,
                title: post.title,
                desc: post.description,
                created_at: post.createdAt,
                comments: post.comments,
                likes: post.likes.length,
            };
        });

        res.status(200).json({ posts: formattedPosts });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}