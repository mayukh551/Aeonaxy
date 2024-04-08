const prisma = require('@prisma/client');
const bcrypt = require('bcryptjs');
const AuthError = require('../error/AppError');
const checkPasswordStrength = require('../util/checkPasswordStrength');
const asyncWrap = require('../middleware/async-wrapper');
const { Resend } = require('resend');
const generateOTP = require('../util/generateOTP');
const createToken = require("../util/createToken");
const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/library");

const prismaClient = new prisma.PrismaClient();

const User = prismaClient.user;
const OTP = prismaClient.otp;


/**
 * Req 1 - for email verification:
 *      Step 1 : Create and save a user instance, and generate OTP and save it to the user instance
 *      Step 2 : send the sasme OTP via email
 *      Error : if sending email fails, del the user instance and throw error
 * 
 * Req 2 - for hashing password and saving it to DB:
 *      Step 1 : If OTP received is correct -> find user using email -> hash password -> update user instance 
 *      Error : If OTP is invalid, delete the User instance and throw error
 */


/**
 * @function verifyEmail
 * @description This function is used to verify the email of the user
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next The next function
 * @returns {Object} The response object
 */
const verifyEmail = asyncWrap(async (req, res, next) => {

    const creds = req.body;
    const { email } = creds;

    // To check if account already exists with the same email
    var user = await User.findUnique({ where: { email: email } })
    if (user) throw new AuthError(401, 'You already have an existing account. Log in!');

    // generate OTP
    var otp = generateOTP();
    console.log('OTP:', otp)

    try {
        await OTP.create({ data: { email: email, otp: otp } });
    } catch (error) {
        throw new AuthError(500, 'Error saving OTP', error);
    }

    // Email verification
    console.log('Email API Key', process.env.EMAIL_API_KEY);
    const resend = new Resend(process.env.EMAIL_API_KEY);

    const { data, error } = resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: "Hello",
        text: `${otp} is your OTP for email verification. Please do not share it with anyone.`,
    })

    if (error) throw new AuthError(500, 'Error sending email', error);


    res.status(200).json({
        isSuccess: true,
        message: 'Email Sent!',
        email: email
    })
})


/**
 * @function savePassword
 * @description This function is used to save the password of the user
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next The next function
 * @returns {Object} The response object
 */
const savePassword = asyncWrap(async (req, res, next) => {

    var { name, email, otp, password, user_type } = req.body;

    var { reset } = req.query;

    reset = reset === 'true' ? true : false;

    console.log('Reset:', reset);

    try {
        // To check if OTP was sent to this email
        const otpData = await OTP.findFirstOrThrow({ where: { email: email, otp: otp } });
        if (!otpData) {
            console.log('OTP not matched ->', 'Server OTP:', otpData, 'Client OTP:', otp);
            throw new AuthError(401, 'Invalid OTP');
        }

        if (otpData.created_at < (new Date(Date.now()))) {
            throw new AuthError(401, 'OTP Expired');
        }
    }

    catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new AuthError(401, 'Invalid Email / OTP provided', error);
        }

        throw new AuthError(500, 'Error finding OTP', error);
    }


    // remove all OTPs related to this email from the DB
    try {
        await OTP.deleteMany({ where: { email: email } });
    }
    catch (error) {
        throw new AuthError(500, 'Error deleting OTPs', error);
    }

    // create random salt and add to password
    var salt = await bcrypt.genSalt(10);
    sale = salt ? salt : 10;

    // check password strength
    if (!checkPasswordStrength(password)) throw new AuthError(400, 'Password is weak');

    try {
        // hashing password for storage in DB
        var hashedPassword = await bcrypt.hash(password, salt);
    } catch (error) {
        throw new AuthError(500, 'Error hashing password', error);
    }

    if (reset === true) {
        try {
            await User.update({ where: { email: email }, data: { password: hashedPassword } });
            return res.status(200).json({ message: "Password Reset Successfully" });
        } catch (error) {
            throw new AuthError(500, 'Error saving new password', error);
        }
    }

    // if this is not reseting password, but creating new user, name is req then
    const newUserData = {
        email: email,
        password: hashedPassword,
        name: name,
        user_type: user_type
    }

    try {
        const newUser = await User.create({
            data: newUserData,
            select: {
                id: true,
                email: true,
                name: true,
                user_type: true
            }
        });

        const payload = {
            id: newUser.id,
            email: email
        }

        res.status(200).json({
            isSuccess: true,
            token: createToken(payload),
            user: newUser
        })


    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002')
            throw new AuthError(401, 'Email already exists');
        throw new AuthError(500, 'Error saving password', error);
    }

})


/**
 * @function login
 * @description This function is used to login the user
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next The next function
 * @returns {Object} The response object
 */
const login = asyncWrap(async (req, res, next) => {

    const user = await User.findUnique({ where: { email: req.body.email } })

    // if user does not exist
    if (!user) throw new AuthError(400, 'Invalid Email!');

    // comparing login password with password from DB
    const isValidPassword = await bcrypt.compare(req.body.password, user.password);

    if (!isValidPassword) throw new AuthError(400, 'Invalid Password!');

    // create token
    const payload = {
        id: user.id,
        email: user.email
    };

    res.status(200).json({
        isSuccess: true,
        token: createToken(payload),
    })

})


const resetPassword = asyncWrap(async (req, res, next) => {

    const resend = new Resend(process.env.EMAIL_API_KEY);

    const { email } = req.body;

    const user = await User.findUnique({ where: { email: email } });

    if (!user) throw new UserError(400, "Invalid Email");

    const otp = generateOTP();
    console.log('OTP:', otp);

    try {
        await OTP.create({ data: { email: email, otp: otp } });
    } catch (error) {
        throw new AuthError(500, 'Error creating OTP', error);
    }

    const { data, error } = resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: "Password Reset Request",
        text: `${otp} is your OTP for Password Reset. Please do not share it with anyone.`,
    })

    if (error) throw new UserError(500, 'Error sending email', error);

    res.status(200).json({ message: "OTP Sent Successfully" });

});


module.exports = {
    login,
    verifyEmail,
    savePassword,
    resetPassword
}