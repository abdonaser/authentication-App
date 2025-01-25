const express = require('express');
const router = express.Router();
const userController = require('../Controllers/usersController');
const verifyJWT = require('../middleWares/verifyJWT');

// Apply the JWT verification middleware to all routes in this router
router.use(verifyJWT);

// GET / - Retrieve all users (protected route)
router.get('/', userController.getAllUsers);

module.exports = router;
