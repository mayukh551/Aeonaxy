const Joi = require('joi');
const ValidationError = require('../error/ValidationError');

function validateSchema(schema, req, next) {
    const { error } = schema.validate(req.body);
    if (error) next(new ValidationError(400, error.details[0].message));
    else next();
}

function validateCourseSchema(req, res, next) {
    const courseSchema = Joi.object({
        name: Joi.string().required().trim().min(1).max(40),
        price: Joi.number().required().min(1).max(999999999999999),
        level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').required(),
        rating: Joi.number().positive().min(0).max(5),
        category: Joi.string().trim().min(1).max(40),
        description: Joi.string().trim().min(1).max(2000).optional(),
    })

    validateSchema(courseSchema, req, next);
}

function validateUserLoginSchema(req, res, next) {

    const userLoginSchema = Joi.object({
        email: Joi.string().email().required().trim().min(1).max(40),
        password: Joi.string().required().trim().min(6).max(1000000),
    })

    validateSchema(userLoginSchema, req, next);
}


function validateSavePasswordSchema(req, res, next) {

    var savePasswordSchema;

    if (req.query.reset === 'false') {

        savePasswordSchema = Joi.object({
            name: Joi.string().trim().min(1).max(40).required(),
            password: Joi.string().required().trim().min(6).max(1000000),
            email: Joi.string().email().required().trim().min(1).max(40),
            otp: Joi.number().max(9999).required(),
            user_type: Joi.string().valid('USER', 'ADMIN').required()
        })
    }

    else if (req.query.reset === 'true') {

        savePasswordSchema = Joi.object({
            password: Joi.string().required().trim().min(6).max(1000000),
            email: Joi.string().email().required().trim().min(1).max(40),
            otp: Joi.number().max(9999).required(),
        })
    }

    validateSchema(savePasswordSchema, req, next);
}


function validateUserRegisterSchema(req, res, next) {
    const userRegisterSchema = Joi.object({
        email: Joi.string().email().required().trim().min(1).max(40),
    })

    validateSchema(userRegisterSchema, req, next);
}


function validateEnrollmentSchema(req, res, next) {
    const enrollmentSchema = Joi.object({
        courseId: Joi.string().required().trim(),
        userId: Joi.string().required().trim()
    })

    validateSchema(enrollmentSchema, req, next);
}


module.exports = {
    validateCourseSchema,
    validateUserLoginSchema,
    validateUserRegisterSchema,
    validateEnrollmentSchema,
    validateSavePasswordSchema
};