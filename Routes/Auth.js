const express = require('express');
const router = express.Router();
const authControlers = require('../Controllers/AuthControllers');

router.post('/register', authControlers.register);
router.post('/login', authControlers.login);
router.get('/refresh', authControlers.refresh);
router.post('/logout', authControlers.logout);

module.exports = router;
