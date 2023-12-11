const express = require('express'); // we need to get the router
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const req = require('express/lib/request');
const jwtSecret = process.env.JWT_SECRET;


const adminLayout = '../views/layouts/admin';

/**
 * 
 * Check - Login 
 */
const authMiddleware = (req,res,next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({message: 'Unauthorized'})
    } else {
        try{
            const decoded =jwt.verify(token, jwtSecret);
            req.userId = decoded.userId;
            next();
        } catch(error) {
            res.status(401).json({message: 'Unauthorized'});
        }
    }
}

/**
 * GET
 * Admin - Login page
 */

router.get('/admin', async (req,res) => {
   

    try {

        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDb"
        }

        res.render('admin/index',{locals, layout: adminLayout});

    } catch (error) {
        console.log(error);
    }
});

/**
 * Post
 * Admin - Check login
 */
router.post('/admin', async (req,res) => {
   

    try {

        const {username, password} = req.body;
        const user = await User.findOne({username});

        if(!user){
            return res.status(401).json({message: 'Invalid Credentials'})
        };

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid Credentials'});
        }

        const token = jwt.sign({userId: user._id},jwtSecret);
        res.cookie('token',token, {httpOnly: true});

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

/**
 * Get
 * Admin - DashBoard
 */
router.get('/dashboard',authMiddleware, async (req,res) => {

    try {
        const locals = {
            title: 'Dashboard',
            description: 'Simple whatever'
        }
        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error)
    }
});

/**
 * Get
 * Admin - Create New Post
 */
router.get('/add-post',authMiddleware, async (req,res) => {

    try {
        const locals = {
            title: 'Add Post',
            description: 'Simple Blog created with MongoDB, Nodejs & Express'
        }
        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout

        });
    } catch (error) {
        console.log(error)
    }
});

/**
 * Post
 * Admin - Create New Post
 */
router.post('/add-post',authMiddleware, async (req,res) => {

    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard')

        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error)
    }
});

/**
 * Get
 * Admin - Edit Post
 */
router.get('/edit-post/:id',authMiddleware, async (req,res) => {

    try {
        const locals = {
            title: "Edit Post",
            description: "NodeJs user Management System",
        }
        const data = await Post.findOne({_id:req.params.id});

        res.render('admin/edit-post', {
            data,
            layout: adminLayout,
            locals
        })

        

    } catch (error) {
        console.log(error)
    }
});

/**
 * Put
 * Admin - Edit Post
 */
router.post('/edit-post/:id',authMiddleware, async (req,res) => {

    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`)

    } catch (error) {
        console.log(error)
    }
});

/**
 * Delete
 * Admin - delete Post
 */
router.delete('/delete-post/:id',authMiddleware, async (req,res) => {
    try {
        await Post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log (error);
    }
});

/**
 * Get
 * Admin - Log out
 */
router.get('/logout',(req,res) => {
    res.clearCookie('token');
    res.redirect('/');
});


/**
 * Post
 * Admin - Register login
 */
router.post('/register', async (req,res) => {
   

    try {
        const { username, password } = req.body;
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: 'User Created', user });
    } catch (error) {
        // const user = await User.findOne({username});

        if (user) {
            res.status(409).json({ message: 'User already registered' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    
});


module.exports = router;
