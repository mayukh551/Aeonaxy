const express = require('express');
const isAdmin = require('../middleware/is-admin');
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/course');
const verifyUser = require('../middleware/verify-user');
const { validateCourseSchema } = require('../middleware/validate-schema');

const router = express.Router();

//* Verify User -> Check if Admin -> schema validation -> Api logic

// GET a specific course or all courses
router.get('/', getCourses);

// CREATE a new course
router.post('/', verifyUser, isAdmin, validateCourseSchema, createCourse);

// UPDATE a course
router.put('/:courseId', verifyUser, isAdmin, updateCourse);

// DELETE a course
router.delete('/:courseId', verifyUser, isAdmin, deleteCourse);

module.exports = router;