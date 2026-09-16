import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import { sendTokenResponse } from "../../../utils/Generatetoken.js";

import { sendEmail } from "../../../helpers/sendEmail.js";

import * as userService from "../service/User.service.js";


// =========================================
// REGISTER
// =========================================

export const register = asyncHandler(
  async (req, res) => {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    const user =
      await userService.registerUser({
        name,
        email,
        password,
        phone,
      });

    return sendTokenResponse(
      apiResponse,
      user,
      201,
      res,
      "Registered successfully"
    );
  }
);


// =========================================
// LOGIN
// =========================================

export const login = asyncHandler(
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    const user =
      await userService.loginUser({
        email,
        password,
      });

    return sendTokenResponse(
      apiResponse,
      user,
      200,
      res,
      "Logged in successfully"
    );
  }
);


// =========================================
// LOGOUT
// =========================================

export const logout = asyncHandler(
  async (req, res) => {
    res.cookie(
      "accessToken",
      "none",
      {
        expires:
          new Date(
            Date.now() + 10 * 1000
          ),

        httpOnly: true,
      }
    );

    return apiResponse(
      res,
      200,
      "Logged out successfully",
      null
    );
  }
);


// =========================================
// GET ME
// =========================================

export const getMe = asyncHandler(
  async (req, res) => {
    const user =
      await userService.getUserById(
        req.user.id
      );

    return apiResponse(
      res,
      200,
      "User fetched successfully",
      {
        user,
      }
    );
  }
);


// =========================================
// UPDATE ME
// =========================================

export const updateMe = asyncHandler(
  async (req, res) => {
    const user =
      await userService.updateUserProfile(
        req.user.id,
        req.body
      );

    return apiResponse(
      res,
      200,
      "Profile updated successfully",
      {
        user,
      }
    );
  }
);


// =========================================
// CHANGE PASSWORD
// =========================================

export const changePassword =
  asyncHandler(
    async (req, res) => {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      const user =
        await userService.changeUserPassword(
          req.user.id,
          currentPassword,
          newPassword
        );

      return sendTokenResponse(
        apiResponse,
        user,
        200,
        res,
        "Password changed successfully"
      );
    }
  );


// =========================================
// FORGOT PASSWORD
// Step 1: Send OTP
// =========================================

export const forgotPassword =
  asyncHandler(
    async (req, res) => {
      const { email } =
        req.body;

      const { otp } =
        await userService.createPasswordResetOtp(
          email
        );

      await sendEmail(
        email,
        otp,
        "forgot-password"
      );

      return apiResponse(
        res,
        200,
        "OTP sent to your email",
        null
      );
    }
  );


// =========================================
// VERIFY RESET OTP
// Step 2
// =========================================

export const verifyResetOtp =
  asyncHandler(
    async (req, res) => {
      const {
        email,
        otp,
      } = req.body;

      const resetToken =
        await userService.verifyPasswordResetOtp(
          email,
          otp
        );

      return apiResponse(
        res,
        200,
        "OTP verified successfully",
        {
          resetToken,
        }
      );
    }
  );


// =========================================
// RESET PASSWORD
// Step 3
// =========================================

export const resetPassword =
  asyncHandler(
    async (req, res) => {
      const {
        resetToken,
        newPassword,
      } = req.body;

      const user =
        await userService.resetUserPassword(
          resetToken,
          newPassword
        );

      return sendTokenResponse(
        apiResponse,
        user,
        200,
        res,
        "Password reset successful"
      );
    }
  );


// =========================================
// VERIFY EMAIL
// =========================================

export const verifyEmail =
  asyncHandler(
    async (req, res) => {
      const {
        email,
        otp,
      } = req.body;

      const user =
        await userService.verifyEmailOtp(
          email,
          otp
        );

      return sendTokenResponse(
        apiResponse,
        user,
        200,
        res,
        "Email verified successfully"
      );
    }
  );


// =========================================
// RESEND VERIFICATION
// =========================================

export const resendVerification =
  asyncHandler(
    async (req, res) => {
      const { email } =
        req.body;

      await userService.resendVerificationOtp(
        email
      );

      return apiResponse(
        res,
        200,
        "OTP resent to email",
        null
      );
    }
  );


// =========================================
// DEACTIVATE ACCOUNT
// =========================================

export const deactivateMe =
  asyncHandler(
    async (req, res) => {
      await userService.deactivateUser(
        req.user.id
      );

      return apiResponse(
        res,
        200,
        "Account deactivated successfully",
        null
      );
    }
  );


// =========================================
// GET ALL USERS
// =========================================

export const getAllUsers =
  asyncHandler(
    async (req, res) => {
      const {
        page,
        limit,
        role,
      } = req.query;

      const result =
        await userService.getAllUsers({
          page,
          limit,
          role,
        });

      return apiResponse(
        res,
        200,
        "Users fetched successfully",
        result
      );
    }
  );


// =========================================
// UPDATE ROLE
// =========================================

export const updateUserRole =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      const { role } =
        req.body;

      const user =
        await userService.updateUserRole(
          id,
          role
        );

      return apiResponse(
        res,
        200,
        "User role updated successfully",
        {
          user,
        }
      );
    }
  );