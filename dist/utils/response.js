'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatError =
  exports.missingFeilds =
  exports.appErrorResponse =
  exports.sendSuccessResponse =
  exports.sendErrorResponse =
    void 0;
const prisma_1 = require('./prisma');
const formatError = (err) => {
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...err,
  };
};
exports.formatError = formatError;
const sendErrorResponse = (res, code = 400, errorMessage, details, data) => {
  return res.status(code).send({
    status: 'error',
    error: errorMessage,
    ...(details ? { details } : {}),
    data,
  });
};
exports.sendErrorResponse = sendErrorResponse;
const sendSuccessResponse = (res, code, data, message = 'Successfull') => {
  return res.status(code).send({
    status: 'success',
    data,
    message,
  });
};
exports.sendSuccessResponse = sendSuccessResponse;
const appErrorResponse = (res, err, fallbackMessage = 'Server Error') => {
  const prismaHandled = (0, prisma_1.handlePrismaError)(err);
  const statusCode = prismaHandled.status || 500;
  const message = prismaHandled.message || fallbackMessage;
  console.error(formatError(err));
  return sendErrorResponse(res, statusCode, message, formatError(err));
};
exports.appErrorResponse = appErrorResponse;
const missingFeilds = (res) => {
  return sendErrorResponse(res, 400, 'Some feilds are missings');
};
exports.missingFeilds = missingFeilds;
//# sourceMappingURL=response.js.map
