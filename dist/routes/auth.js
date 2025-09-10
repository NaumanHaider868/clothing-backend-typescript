'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = require('express');
const controllers_1 = require('../controllers');
const validators_1 = require('../validators');
const enums_1 = require('../enums');
const router = (0, express_1.Router)();
router.post(
  '/login',
  validators_1.authValidator.getMiddleware(enums_1.AuthSchema.Login),
  controllers_1.login
);
router.post(
  '/register',
  validators_1.authValidator.getMiddleware(enums_1.AuthSchema.Register),
  controllers_1.register
);
router.post(
  '/verify-email',
  validators_1.authValidator.getMiddleware(enums_1.AuthSchema.Verify_Email),
  controllers_1.verifyEmail
);
router.post(
  '/verification-check',
  validators_1.authValidator.getMiddleware(enums_1.AuthSchema.Verify_User),
  controllers_1.verificationCheck
);
router.post(
  '/resend-verification-email',
  validators_1.authValidator.getMiddleware(enums_1.AuthSchema.Send_Email_Again),
  controllers_1.resendVerificationEmail
);
router.post(
  '/request-forget-password',
  validators_1.authValidator.getMiddleware(enums_1.AuthSchema.Forgot_Password),
  controllers_1.forgetPasswordEmail
);
router.post(
  '/reset-password',
  validators_1.authValidator.getMiddleware(enums_1.AuthSchema.Reset_Password),
  controllers_1.resetPassword
);
exports.default = router;
//# sourceMappingURL=auth.js.map
