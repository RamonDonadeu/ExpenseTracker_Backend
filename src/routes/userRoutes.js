const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.get('/', userController.getUser);

router.post('/', userController.createUser);

router.put('/', userController.updateUser);

router.post('/login', userController.login);

module.exports = router;