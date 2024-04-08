const express = require('express');
const { login, verifyEmail, savePassword, resetPassword } = require('../controllers/auth');
const { updateProfile, deleteAccount } = require('../controllers/profile');
const verifyUser = require('../middleware/verify-user');
const router = express.Router();
const { validateUserLoginSchema, validateUserRegisterSchema, validateSavePasswordSchema } = require('../middleware/validate-schema');


// for authentication
router.route('/login').post(validateUserLoginSchema, login);
router.route('/save-password').post(validateSavePasswordSchema, savePassword);
router.route('/verify-email').post(validateUserRegisterSchema, verifyEmail);
router.route('/reset-password').post(verifyUser, resetPassword);

// for user account
router.route('/:userId')
    .put(verifyUser, updateProfile)
    .delete(verifyUser, deleteAccount);


module.exports = router;