const { PrismaClient } = require('@prisma/client');
const asyncWrap = require('./async-wrapper');
const AuthError = require('../Error/AuthError');
const prisma = new PrismaClient();

const User = prisma.user;


const isAdmin = asyncWrap(async (req, res, next) => {

    // extract user id from req object
    const userId = req['user-id'];

    const user = await User.findUnique({
        where: {
            id: userId
        },
        select: {
            user_type: true
        }
    })

    if (!user)
        throw new AuthError(401, 'User not found');


    if (user.user_type === 'ADMIN') {
        next();
    }

    else {
        res.status(401).json({
            message: 'Only admins can make this request'
        })
    }
})


module.exports = isAdmin;