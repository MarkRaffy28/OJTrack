const joi = require('joi');

exports.studentRegistrationSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required(),
  password: joi.string().min(6).required(),
  firstName: joi.string().required(),
  middleName: joi.string().allow('', null),
  lastName: joi.string().required(),
  extensionName: joi.string().allow('', null),
  studentID: joi.string().required(),
  birthDate: joi.date().iso().required(),
  gender: joi.string().valid('Male', 'Female', 'Other').required(),
  address: joi.string().required(),
  contactNumber: joi.string().pattern(/^[0-9]+$/).min(10).required(),
  email: joi.string().email().required(),
  yearLevel: joi.number().integer().min(1).max(5).required(),
  program: joi.string().required(),
  major: joi.string().allow('', null)
});