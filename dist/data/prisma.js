'use strict';
// utils/prismaErrorMessages.ts
Object.defineProperty(exports, '__esModule', { value: true });
exports.prismaErrorMessages = void 0;
const enums_1 = require('../enums');
const prismaErrorMessages = {
  [enums_1.PrismaErrorCode.UniqueConstraintFailed]: 'That already exists. Try a different value.',
  [enums_1.PrismaErrorCode.ForeignKeyConstraintFailed]:
    'Invalid reference. Please check related fields.',
  [enums_1.PrismaErrorCode.RecordNotFound]: 'No matching record found.',
  [enums_1.PrismaErrorCode.QueryParamMissing]: 'Missing required query parameters.',
  [enums_1.PrismaErrorCode.NullConstraintViolation]: 'Required field cannot be null.',
  [enums_1.PrismaErrorCode.RelationViolation]: 'Relation constraint failed.',
  [enums_1.PrismaErrorCode.RequiredRelationMissing]: 'Required relation is missing.',
  [enums_1.PrismaErrorCode.ValueOutOfRange]: 'Value is out of allowed range.',
  [enums_1.PrismaErrorCode.ConstraintViolation]: 'Input violates constraint.',
  [enums_1.PrismaErrorCode.InvalidInput]: 'Invalid input. Please check your data.',
  [enums_1.PrismaErrorCode.TooManyRequests]: 'Too many requests. Please try again later.',
};
exports.prismaErrorMessages = prismaErrorMessages;
//# sourceMappingURL=prisma.js.map
