const { body, validationResult } = require("express-validator");
const ERROR_CODES = require("../utils/errorCodes.util");
const ERROR_MESSAGES = require("../utils/errorMessage.util");

const userRegister = [
  body("email")
    .notEmpty()
    .withMessage({
      errorCode: ERROR_CODES.EMAIL_IS_REQUIRED,
      message: ERROR_MESSAGES.EMAIL_IS_REQUIRED,
    })
    .isString()
    .withMessage({
      errorCode: ERROR_CODES.EMAIL_MUST_BE_STRING,
      message: ERROR_MESSAGES.EMAIL_MUST_BE_STRING,
    })
    .trim()

    .isLength({ min: 6, max: 50 })
    .withMessage({
      errorCode: ERROR_CODES.Email_MUST_BE_LESSTHAN_51,
      message: ERROR_MESSAGES.Email_MUST_BE_LESSTHAN_51,
    }),
  body("userName")
 
    .optional() // Makes validation conditional (only if the value is provided)
    .isString()
    .withMessage({
      errorCode: ERROR_CODES.USERNAME_MUST_BE_STRING,
      message: ERROR_MESSAGES.USERNAME_MUST_BE_STRING,
    })
    .trim()
    .isLength({ min: 6, max: 250 })
    .withMessage({
      errorCode: ERROR_CODES.USERNAME_MUST_BE_LESSTHAN_51,
      message: ERROR_MESSAGES.USERNAME_MUST_BE_LESSTHAN_51,
    }),
  body("phoneNumber")
    .optional() // Makes validation conditional (only if the value is provided)
    .isString()
    .withMessage({
      errorCode: ERROR_CODES.PHONENUMBER_MUST_BE_STRING,
      message: ERROR_MESSAGES.PHONENUMBER_MUST_BE_STRING,
    }),
  body("password")
    .notEmpty()
    .withMessage({
      errorCode: ERROR_CODES.PASSWORD_IS_REQUIRED,
      message: ERROR_MESSAGES.PASSWORD_IS_REQUIRED,
    })
    .isString()
    .withMessage({
      errorCode: ERROR_CODES.PASSWORD_MUST_BE_STRING,
      message: ERROR_MESSAGES.PASSWORD_MUST_BE_STRING,
    })
    .isLength({ min: 8, max: 25 }) // You can set your own password length requirement
    .withMessage({
      errorCode: ERROR_CODES.PASSWORD_MIN_LENGTH,
      message: ERROR_MESSAGES.PASSWORD_MIN_LENGTH,
    })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).*$/)
    .withMessage({
      errorCode: ERROR_CODES.PASSWORD_COMPLEXITY,
      message: ERROR_MESSAGES.PASSWORD_COMPLEXITY,
    }),
];

const categoryAdd = [
  body("name")
    .notEmpty()
    .withMessage({
      errorCode: ERROR_CODES.CATEGORYNAME_IS_REQUIRED,
      message: ERROR_MESSAGES.CATEGORYNAME_IS_REQUIRED,
    })
    .isString()
    .withMessage({
      errorCode: ERROR_CODES.CATEGORYNAME_MUST_BE_STRING,
      message: ERROR_MESSAGES.CATEGORYNAME_MUST_BE_STRING,
    })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage({
      errorCode: ERROR_CODES.CATEGORYNAME_MUST_BE_LESSTHAN_51,
      message: ERROR_MESSAGES.CATEGORYNAME_MUST_BE_LESSTHAN_51,
    }),
  body("description")
    .notEmpty()
    .withMessage({
      errorCode: ERROR_CODES.Description_IS_REQUIRED,
      message: ERROR_MESSAGES.Description_IS_REQUIRED,
    })
    .isString()
    .withMessage({
      errorCode: ERROR_CODES.Description_MUST_BE_STRING,
      message: ERROR_MESSAGES.Description_MUST_BE_STRING,
    })
    .trim()
    .isLength({ min: 5, max: 250 })
    .withMessage({
      errorCode: ERROR_CODES.Description_MUST_BE_LESSTHAN_251,
      message: ERROR_MESSAGES.Description_MUST_BE_LESSTHAN_251,
    }),
];

const foodProductAdd = [
  body("name")
    .notEmpty()
    .withMessage({
      errorCode: ERROR_CODES.NAME_IS_REQUIRED,
      message: ERROR_MESSAGES.NAME_IS_REQUIRED,
    })
    .isString()
    .withMessage({
      errorCode: ERROR_CODES.CATEGORYNAME_MUST_BE_STRING,
      message: ERROR_MESSAGES.CATEGORYNAME_MUST_BE_STRING,
    })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage({
      errorCode: ERROR_CODES.NAME_MUST_BE_LESSTHAN_51,
      message: ERROR_MESSAGES.NAME_MUST_BE_LESSTHAN_51,
    }),
  body("description")
    .notEmpty()
    .withMessage({
      errorCode: ERROR_CODES.Description_IS_REQUIRED,
      message: ERROR_MESSAGES.Description_IS_REQUIRED,
    })
    .isString()
    .withMessage({
      errorCode: ERROR_CODES.Description_MUST_BE_STRING,
      message: ERROR_MESSAGES.Description_MUST_BE_STRING,
    })
    .trim()
    .isLength({ min: 5, max: 250 })
    .withMessage({
      errorCode: ERROR_CODES.Description_MUST_BE_LESSTHAN_251,
      message: ERROR_MESSAGES.Description_MUST_BE_LESSTHAN_251,
    }),
  body("price")
    .notEmpty()
    .withMessage({
      errorCode: ERROR_CODES.PRICE_IS_REQUIRED,
      message: ERROR_MESSAGES.PRICE_IS_REQUIRED,
    })
    .isNumeric()
    .withMessage({
      errorCode: ERROR_CODES.PRICE_MUST_BE_NUMERIC,
      message: ERROR_MESSAGES.PRICE_MUST_BE_NUMERIC,
    }),

    body("stock")
    .notEmpty()
    .withMessage({
      errorCode: ERROR_CODES.STOCK_IS_REQUIRED,
      message: ERROR_MESSAGES.STOCK_IS_REQUIRED,
    })
    .isInt({ min: 0 })
    .withMessage({
      errorCode: ERROR_CODES.STOCK_MUST_BE_NUMERIC,
      message: ERROR_MESSAGES.STOCK_MUST_BE_NUMERIC,
    })
];

module.exports = { userRegister, categoryAdd, foodProductAdd };
