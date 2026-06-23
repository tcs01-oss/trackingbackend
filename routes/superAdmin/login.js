const express = require('express');
const router = express.Router();
const superadminLogin = require('../../controllers/superadmin/login');
const superadminRegister = require('../../controllers/superadmin/register');
const authMiddleware = require('../../middleware/authMiddleware');

router.post('/login', superadminLogin.login);
router.post('/register', superadminRegister.register);


module.exports = router;
   
