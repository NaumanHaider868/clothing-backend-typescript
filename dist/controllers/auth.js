'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.resetPassword =
  exports.forgetPasswordEmail =
  exports.resendVerificationEmail =
  exports.verificationCheck =
  exports.verifyEmail =
  exports.register =
  exports.login =
    void 0;
const utils_1 = require('../utils');
const config_1 = require('../config');
const utils_2 = require('../utils');
const utils_3 = require('../utils');
const enums_1 = require('../enums');
const mailConnector_1 = require('../utils/mailConnector');
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await config_1.prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      const token = (0, utils_3.getJWTToken)(
        { userId: existingUser.userId },
        { expiresIn: '10min', reference: enums_1.TokenIdentifier.VerificationCheck }
      );
      return (0, utils_1.sendErrorResponse)(res, 409, 'User already exists', token);
    }
    const user = await config_1.prisma.users.create({
      data: {
        firstName,
        lastName,
        email,
        password: await (0, utils_1.hashPassword)(password),
        isVerified: false,
      },
    });
    const [emailVerificationToken, verificationCheckToken] = [
      (0, utils_3.getJWTToken)(
        { userId: user.userId },
        { expiresIn: '1min', reference: enums_1.TokenIdentifier.EmailVerification }
      ),
      (0, utils_3.getJWTToken)(
        { userId: user.userId },
        { expiresIn: '10min', reference: enums_1.TokenIdentifier.VerificationCheck }
      ),
    ];
    const verificationUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${emailVerificationToken}`;
    await mailConnector_1.mailConnector.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Confirm Your Email - Union',
      html: `
    <h2>Welcome to Union!</h2>
    <p>Thank you for joining our fashion community. Please confirm your email address by clicking the button below:</p>
    <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Confirm Email</a>
    <p>Once confirmed, you’ll be able to explore the latest collections, exclusive discounts, and new arrivals.</p>
    <p>If you did not create an account, you can safely ignore this email.</p>
    <p>This link will expire in 10 minutes.</p>
  `,
    });
    return (0, utils_1.sendSuccessResponse)(
      res,
      200,
      { token: verificationCheckToken },
      'Registration successful! Please check your email to verify your account.'
    );
  } catch (error) {
    return (0, utils_1.appErrorResponse)(res, error);
  }
};
exports.register = register;
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await config_1.prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return (0, utils_1.sendErrorResponse)(res, 400, 'Invalid Credentials');
    }
    const isPasswordValid = await (0, utils_2.comparePassword)(password, user.password);
    if (!isPasswordValid) return (0, utils_1.sendErrorResponse)(res, 400, 'Invalid Credentials');
    if (!user.isVerified) {
      const [emailVerificationToken, verificationCheckToken] = [
        (0, utils_3.getJWTToken)(
          { userId: user.userId },
          { expiresIn: '10min', reference: enums_1.TokenIdentifier.EmailVerification }
        ),
        (0, utils_3.getJWTToken)(
          { userId: user.userId },
          { expiresIn: '10min', reference: enums_1.TokenIdentifier.VerificationCheck }
        ),
      ];
      const verificationUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${emailVerificationToken}`;
      await mailConnector_1.mailConnector.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Confirm Your Email - Union',
        html: `
    <h2>Welcome to Union!</h2>
    <p>Thank you for joining our fashion community. Please confirm your email address by clicking the button below:</p>
    <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Confirm Email</a>
    <p>Once confirmed, you’ll be able to explore the latest collections, exclusive discounts, and new arrivals.</p>
    <p>If you did not create an account, you can safely ignore this email.</p>
    <p>This link will expire in 10 minutes.</p>
  `,
      });
      return (0, utils_1.sendSuccessResponse)(
        res,
        200,
        {
          token: verificationCheckToken,
          isVerified: false,
        },
        'User not verified. Please verify first'
      );
    }
    return (0, utils_1.sendSuccessResponse)(res, 200, user, 'Login Successfully');
  } catch (error) {
    return (0, utils_1.appErrorResponse)(res, error);
  }
};
exports.login = login;
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const { error, payload, isValid } = (0, utils_1.checkJwtToken)(token, ['userId'], {
      expiredMessage: 'Verification link has expired. Please request a new one.',
      reference: enums_1.TokenIdentifier.EmailVerification,
    });
    if (!isValid) return (0, utils_1.sendErrorResponse)(res, 401, error);
    const { userId } = payload;
    const user = await config_1.prisma.users.findUnique({
      where: { userId },
    });
    if (!user) return (0, utils_1.sendErrorResponse)(res, 401, 'Invalid verification token');
    await config_1.prisma.users.update({
      where: { userId },
      data: {
        isVerified: true,
      },
    });
    (0, utils_1.sendSuccessResponse)(res, 200, null, 'Email verified successfully');
  } catch (error) {
    return (0, utils_1.appErrorResponse)(res, error);
  }
};
exports.verifyEmail = verifyEmail;
const verificationCheck = async (req, res) => {
  try {
    const { token } = req.body;
    const { error, payload, isValid } = (0, utils_1.checkJwtToken)(token, ['userId'], {
      expiredMessage: 'Verification link has expired. Please request a new one.',
      reference: enums_1.TokenIdentifier.VerificationCheck,
    });
    if (!isValid) return (0, utils_1.sendErrorResponse)(res, 401, error);
    const { userId } = payload;
    const user = await config_1.prisma.users.findUnique({
      where: { userId },
    });
    if (!user.isVerified) return (0, utils_1.sendErrorResponse)(res, 400, 'User not verified');
    const authToken = (0, utils_3.getJWTToken)(
      { userId },
      { expiresIn: '10min', reference: enums_1.TokenIdentifier.Login }
    );
    delete user.password;
    (0, utils_1.sendSuccessResponse)(
      res,
      200,
      { user, token: authToken },
      'Verification complete.'
    );
  } catch (error) {
    return (0, utils_1.appErrorResponse)(res, error);
  }
};
exports.verificationCheck = verificationCheck;
const resendVerificationEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const { error, payload, isValid } = (0, utils_1.checkJwtToken)(token, ['userId'], {
      expiredMessage: 'Verification link has expired. Please request a new one.',
      reference: enums_1.TokenIdentifier.VerificationCheck,
    });
    if (!isValid) return (0, utils_1.sendErrorResponse)(res, 401, error);
    const { userId } = payload;
    const user = await config_1.prisma.users.findUnique({
      where: { userId },
    });
    const verificationToken = (0, utils_3.getJWTToken)(
      { userId: user.userId },
      { expiresIn: '10min', reference: enums_1.TokenIdentifier.EmailVerification }
    );
    const verificationUrl = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${verificationToken}`;
    await mailConnector_1.mailConnector.sendMail({
      from: process.env.MAIL_FROM,
      to: user.email,
      subject: 'Confirm Your Email - Union',
      html: `
    <h2>Welcome to Union!</h2>
    <p>Thank you for joining our fashion community. Please confirm your email address by clicking the button below:</p>
    <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Confirm Email</a>
    <p>Once confirmed, you’ll be able to explore the latest collections, exclusive discounts, and new arrivals.</p>
    <p>If you did not create an account, you can safely ignore this email.</p>
    <p>This link will expire in 10 minutes.</p>
  `,
    });
    (0, utils_1.sendSuccessResponse)(res, 200, null, 'Verification email sent successfully');
  } catch (error) {
    return (0, utils_1.appErrorResponse)(res, error);
  }
};
exports.resendVerificationEmail = resendVerificationEmail;
const forgetPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await config_1.prisma.users.findUnique({
      where: { email },
    });
    if (!user) return (0, utils_1.sendErrorResponse)(res, 404, 'User did not exist!');
    const token = (0, utils_3.getJWTToken)(
      { userId: user.userId },
      { expiresIn: '10min', reference: enums_1.TokenIdentifier.ResetPassword }
    );
    await mailConnector_1.mailConnector.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Reset Your Password - Union',
      html: `
        <h2>Password Reset Request</h2>
        <p>We received a request to reset the password for your Union account. If this was you, click the button below to reset your password:</p>
        <a href="${process.env.CLIENT_URL}/reset-password?token=${token}" 
           style="padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
           Reset Password
        </a>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>This link will expire in 10 minutes for your security.</p>
      `,
    });
    return (0, utils_1.sendSuccessResponse)(res, 200, token, 'Please confirm the email');
  } catch (error) {
    console.log(error);
    return (0, utils_1.appErrorResponse)(res, error);
  }
};
exports.forgetPasswordEmail = forgetPasswordEmail;
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const { error, payload, isValid } = (0, utils_1.checkJwtToken)(token, ['userId'], {
      expiredMessage: 'Verification link has expired. Please request a new one.',
      reference: enums_1.TokenIdentifier.ResetPassword,
    });
    if (!isValid) return (0, utils_1.sendErrorResponse)(res, 401, error);
    const { userId } = payload;
    const user = await config_1.prisma.users.findUnique({
      where: { userId },
    });
    if (!user) return (0, utils_1.sendErrorResponse)(res, 404, 'Invalid verification token');
    const isValidCode = await (0, utils_2.comparePassword)(password, user.password);
    if (!isValidCode) return (0, utils_1.sendErrorResponse)(res, 400, 'Invalid Credentials');
    await config_1.prisma.users.update({
      where: { userId: user.userId },
      data: {
        password: await (0, utils_1.hashPassword)(password),
      },
    });
    delete user.password;
    delete user.verificationCode;
    delete user.userId;
    delete user.createdAt;
    delete user.updatedAt;
    (0, utils_1.sendSuccessResponse)(res, 200, user, 'Password reset successfully');
  } catch (error) {
    return (0, utils_1.appErrorResponse)(res, error);
  }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.js.map
