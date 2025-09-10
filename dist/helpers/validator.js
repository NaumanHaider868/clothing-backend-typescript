'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express_joi_validation_1 = require('express-joi-validation');
const utils_1 = require('../utils');
class ValidatorHelper {
  constructor(validationSchema, options = { allowUnknown: true }) {
    this.validator = (0, express_joi_validation_1.createValidator)({});
    this.validationSchema = validationSchema;
    this.joiValidationOptions = options;
  }
  getValidator() {
    return this.validator;
  }
  getSchema(schemaName) {
    const schema = this.validationSchema[schemaName];
    if (!schema) throw new Error(`Schema "${schemaName}" not found`);
    return schema;
  }
  getMiddleware(
    schemaName,
    options = {
      sanitizeBody: true,
      isQueryParams: false,
      isFormData: false,
    }
  ) {
    const schema = this.getSchema(schemaName);
    return (req, res, next) => {
      const data = options.isQueryParams
        ? req.query
        : options.isFormData
          ? req.fields || {}
          : req.body || {}; // 👈 Fix here
      const { error } = schema.validate(
        options.sanitizeBody ? (0, utils_1.deepSanitize)(data) : data,
        {
          ...this.joiValidationOptions,
          abortEarly: false,
        }
      );
      if (error) {
        return (0, utils_1.sendErrorResponse)(
          res,
          422,
          error.details.map((el) => el.message).join(', ')
        );
      }
      next();
    };
  }
}
exports.default = ValidatorHelper;
//# sourceMappingURL=validator.js.map
