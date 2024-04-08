const express = require('express');
const { getPurchasedCourses, buyCourse, cancelCourse } = require('../controllers/enrollment');
const verifyUser = require('../middleware/verify-user');
const { validateEnrollmentSchema } = require('../middleware/validate-schema');
const router = express.Router();

router.route('/purchased-courses/').get(verifyUser, getPurchasedCourses);
router.route('/enroll-course/:courseId').post(verifyUser, buyCourse);
router.route('/cancel-enrollment/:enrollId').delete(verifyUser, cancelCourse);

module.exports = router;