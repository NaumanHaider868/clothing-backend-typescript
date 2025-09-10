'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.handlePrismaError = void 0;
const client_1 = require('@prisma/client');
const data_1 = require('../data');
const handlePrismaError = (error) => {
  if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
    const message = data_1.prismaErrorMessages[error.code] || 'A database error occurred.';
    return { status: 400, message };
  }
  if (error instanceof client_1.Prisma.PrismaClientValidationError) {
    return {
      status: 422,
      message: 'Validation failed. Check your input values.',
    };
  }
  return {
    status: 500,
    message: 'Unexpected server error. Try again later.',
  };
};
exports.handlePrismaError = handlePrismaError;
//# sourceMappingURL=prisma.js.map
