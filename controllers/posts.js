const Post = require("../models/posts")
const User = require("../models/user")


exports.createPost = async (req, res) => {
    const { userId } = req;
    const { title, description } = req.body;

    try {
        // Create a new post
        const post = new Post({
            title,
            description,
            author: userId,
        });

        // Save the post
        await post.save();
        res.json({
            id: post._id,
            description: post.description,
            title: post.title,
            createdAt: post.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deletePost = async (req, res) => {
    const { userId } = req
    const { id } = req.params;

    try {
        // Find the post by ID
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the creator of the post
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
        // Find the post by ID
        const post = await Post.findById(id)
            .populate('author', 'name')
            .populate('likes', 'name')
            .populate('comments.author', 'name')

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Get the number of likes and comments
        const likeCount = post.likes.length;
        const commentCount = post.comments.length;

        // Prepare the post data to send in the response
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
        // Find all posts created by the authenticated user
        const posts = await Post.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate('comments.author', 'name')
            .populate('likes', 'name');

        // Prepare the data for each post
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

        res.json({ posts: formattedPosts });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}