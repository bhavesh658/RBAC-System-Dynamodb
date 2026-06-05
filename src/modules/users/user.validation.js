const { body } = require('express-validator');

const createUserValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('password')
    .isLength({ min: 6 })
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage('Password must be at least 6 characters and contain uppercase, lowercase, number and symbol'),


];



module.exports = {
  createUserValidation,
};