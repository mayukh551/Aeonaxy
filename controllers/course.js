const { PrismaClient } = require('@prisma/client');
const asyncWrap = require('../middleware/async-wrapper');
const prisma = new PrismaClient();
const CourseError = require('../error/CourseError');
const { PrismaClientKnownRequestError } = require('@prisma/client/runtime/library');

const Course = prisma.course;

const getCourses = asyncWrap(async (req, res, next) => {

    var { id, limit, page } = req.query;

    if (id) {
        const course = await Course.findUnique({
            where: { id: id }
        });

        if (!course) throw new CourseError(400, "Invalid Course ID");

        return res.status(200).json(course)
    }


    var filter = {};

    console.log(limit, page);

    if (req.query.name) filter.name = req.query.name;
    if (req.query.level) filter.level = req.query.level;
    // if (req.query.rating) filter.rating = parseFloat(req.query.rating);
    // if (req.query.price) filter.price = parseInt(req.query.price);
    if (req.query.category) filter.category = req.query.category;

    console.log(filter);

    // if filter is undefined
    if (Object.keys(filter).length === 0) filter = undefined;

    limit = limit ? parseInt(limit) : 10; // keeping 10 as default no. of courses per page
    page = page ? parseInt(page) : 1; // keeping 1 as default page number

    const courses = await Course.findMany({
        where: {
            ...filter
        },
        take: limit,
        skip: (page - 1) * limit
    });

    if (!courses) throw new CourseError(400, "No courses found");

    res.status(200).json({ data: courses });

});


const createCourse = asyncWrap(async (req, res, next) => {

    const data = req.body;

    const userId = req['user-id'];

    data.user_id = userId;

    try {

        const course = await Course.create({
            data: data
        });

        res.status(201).json({ message: "Course created successfully", data: course });

    } catch (error) {

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002')
            throw new CourseError(400, "Course with same name already exists", error);

        throw new CourseError(500, "Error Creating New Course", error);
    }

});


const updateCourse = asyncWrap(async (req, res, next) => {

    const { courseId: id } = req.params;

    const data = req.body;

    try {

        const course = await Course.update({
            where: { id: id },
            data: data
        });

        res.status(200).json({ message: "Course updated successfully", data: course });

    } catch (error) {
        throw new CourseError(400, "Invalid Course ID", error);
    }


});


/**
 * Delete a course
 * @function deleteCourse
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void>}
 */
const deleteCourse = asyncWrap(async (req, res, next) => {

    const { courseId: id } = req.params;

    try {

        await Course.delete({
            where: { id: id }
        });

    } catch (error) {
        throw new CourseError(400, "Invalid Course ID", error);
    }

    res.status(200).json({ message: "Course deleted successfully" });

});


module.exports = {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
};