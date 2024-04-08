const { PrismaClient } = require('@prisma/client');
const asyncWrap = require('../middleware/async-wrapper');
const prisma = new PrismaClient();
const CourseError = require('../error/CourseError');
const dotenv = require('dotenv').config({ path: '../.env' });
const { Resend } = require('resend');
const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/library");

const Enroll = prisma.enrollment;
const User = prisma.user;
const Course = prisma.course;


const getPurchasedCourses = asyncWrap(async (req, res, next) => {
    const userId = req['user-id'];

    const enrolledCourses = await Enroll.findMany({
        where: {
            user_id: userId
        }
    })

    if (!enrolledCourses) throw new CourseError(400, "No courses found");

    res.status(200).json({ data: enrolledCourses });
});


const buyCourse = asyncWrap(async (req, res, next) => {

    const { courseId } = req.params;

    if (!courseId) throw new CourseError(400, "Course Id is required");

    const userId = req['user-id']; // always defined

    const resend = new Resend(process.env.EMAIL_API_KEY);

    // TODO 1: check if user has already bought the course

    try {

        var enrollment = await Enroll.create({
            data: {
                course_id: courseId,
                user_id: userId
            }
        });
    }

    catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') // Unique constraint violation
            throw new CourseError(403, "You have already enrolled into this course", error);

        else throw new CourseError(500, "Error buying course", error);
    }

    try {
        var course = await Course.findUniqueOrThrow({
            where: { id: courseId }
        });

    } catch (error) {
        throw new CourseError(400, "Invalid Course Id", error);
    }

    try {
        var user = await User.findUniqueOrThrow({
            where: { id: userId }
        });

    }
    catch (error) {
        throw new CourseError(400, "Invalid User Id", error);
    }


    const { data, error } = resend.emails.send({
        to: user.email,
        from: 'onboarding@resend.dev',
        subject: "Course Enrollment Confirmation",
        message: `You have successfully enrolled in the course ${course.name}`
    })

    if (error) throw new CourseError(500, "Error sending email", error);

    res.status(201).json({ data: enrollment, message: "Course Enrollment Successfull" });

});


const cancelCourse = asyncWrap(async (req, res, next) => {

    const { enrollId: id } = req.params;

    await Enroll.delete({
        where: { id: id }
    });

    res.status(200).json({ message: "Enrollment cancelled successfully" });

});


module.exports = {
    getPurchasedCourses,
    buyCourse,
    cancelCourse
}