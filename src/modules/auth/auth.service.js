const tokenBlacklistRepository = require('../auth/tokenBlacklist.repository');
const userRepository = require('../users/user.repository');
const AppError = require('../../common/AppError');
const HTTP_STATUS = require('../../constants/httpStatus');
const { generateAccessToken, generateRefreshToken, sendEmail } = require('./auth.utils');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const loginUser = async ({
    email,
    password,
}) => {
    const user =
        await userRepository.findByEmail(
            email.toLowerCase()
        );

    if (!user) {
        throw new AppError(
            "Invalid email or password",
            HTTP_STATUS.UNAUTHORIZED
        );
    }

    if (!user.isActive) {
        throw new AppError(
            "Your account is inactive. Please contact the administrator.",
            HTTP_STATUS.FORBIDDEN
        );
    }

    const isPasswordValid =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!isPasswordValid) {
        throw new AppError(
            "Invalid email or password",
            HTTP_STATUS.UNAUTHORIZED
        );
    }

    const accessToken =
        generateAccessToken(user);
    const refreshToken =
        generateRefreshToken(user);
    await userRepository.updateRefreshToken(
        user.userId,
        refreshToken
    );
    delete user.password;

    return {
        accessToken,
        refreshToken,
        user,
    };
};


const logoutUser = async (
    accessToken,
    refreshToken
) => {

    if (accessToken) {
        const decoded = jwt.decode(
            accessToken
        );

        if (decoded?.exp) {
            await tokenBlacklistRepository.create(
                accessToken,
                decoded.exp
            );
        }
    }

    if (refreshToken) {

        const user =
            await userRepository.findByRefreshToken(
                refreshToken
            );

        if (user) {
            await userRepository.clearRefreshToken(
                user.userId
            );
        }
    }

    return true;
};


const forgotPassword = async (email) => {
    const user = await userRepository.findByEmail(
        email.toLowerCase()
    );

    if (!user) {
        throw new AppError(
            'If an account exists with this email, a password reset OTP has been sent.',
            HTTP_STATUS.NOT_FOUND
        );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    // Hash OTP
    const hashedOtp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    // Save hashed OTP and expiry (10 minutes)
    await userRepository.updateUser(
        user.userId,
        {
            resetPasswordOtp: hashedOtp,
            resetPasswordOtpExpires:
                new Date(
                    Date.now() + 10 * 60 * 1000
                ).toISOString(),
        }
    );

    // Send email
    await sendEmail({
        to: user.email,
        subject: 'Reset Password OTP',
        html: `
      <h2>RBAC System Password Reset</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    `,
    });

    return {
        message: 'If an account exists with this email, a password reset OTP has been sent.',
    };
};


const resetPassword = async (
    email,
    otp,
    newPassword
) => {
    const user =
        await userRepository.findByEmail(
            email.toLowerCase()
        );

    if (
        !user ||
        user.resetPasswordOtp !== hashedOtp ||
        new Date(
            user.resetPasswordOtpExpires
        ) < new Date()
    ) {
        throw new AppError(
            "Invalid or expired OTP",
            HTTP_STATUS.BAD_REQUEST
        );
    }

    const hashedPassword =
        await bcrypt.hash(
            newPassword,
            10
        );

    await userRepository.updateUser(
        user.userId,
        {
            password: hashedPassword,
            resetPasswordOtp: null,
            resetPasswordOtpExpires: null,
        }
    );

    return {
        message:
            "Password reset successfully",
    };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await userRepository.findById(userId)
    if (!user) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updateUser(userId, { password: hashedNewPassword });
    return {
        message: 'Password changed successfully',
    };
}


module.exports = {
    loginUser, forgotPassword, resetPassword, changePassword, logoutUser
};