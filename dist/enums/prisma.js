'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PrismaErrorCode = void 0;
var PrismaErrorCode;
(function (PrismaErrorCode) {
  PrismaErrorCode['UniqueConstraintFailed'] = 'P2002';
  PrismaErrorCode['ForeignKeyConstraintFailed'] = 'P2003';
  PrismaErrorCode['RecordNotFound'] = 'P2025';
  PrismaErrorCode['QueryParamMissing'] = 'P2011';
  PrismaErrorCode['NullConstraintViolation'] = 'P2010';
  PrismaErrorCode['RelationViolation'] = 'P2014';
  PrismaErrorCode['RequiredRelationMissing'] = 'P2016';
  PrismaErrorCode['ValueOutOfRange'] = 'P2004';
  PrismaErrorCode['ConstraintViolation'] = 'P2005';
  PrismaErrorCode['InvalidInput'] = 'P2009';
  PrismaErrorCode['TooManyRequests'] = 'P2034';
})(PrismaErrorCode || (exports.PrismaErrorCode = PrismaErrorCode = {}));
//# sourceMappingURL=prisma.js.map
