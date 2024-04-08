const prisma = require('@prisma/client');
const asyncWrap = require('../middleware/async-wrapper');
const UserError = require('../error/UserError');
const prismaClient = new prisma.PrismaClient();
const User = prismaClient.user;


// update Profile
const updateProfile = asyncWrap(async (req, res, next) => {

    const { userId: id } = req.params;

    const data = req.body;

    try {

        await User.update({ where: { id: id }, data: data });
        res.status(200).json({ message: "Account Updated Successfully" });

    } catch (error) {
        throw new UserError(400, "Invalid User ID", error);
    }

})


const deleteAccount = asyncWrap(async (req, res, next) => {

    const { userId: id } = req.params;

    const account = await User.findUnique({ where: { id: id } });

    if (!account)
        throw new UserError(401, "User not found");

    res.status(200).json({ message: "Account Deleted Successfully" });
})

module.exports = { updateProfile, deleteAccount };