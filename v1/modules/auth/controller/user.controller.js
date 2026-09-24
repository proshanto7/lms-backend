import { asyncHandler } from "../../../utils/asyncHandler.js";
import { apiResponse } from "../../../utils/apiResponse.js";
import AppError from "../../../utils/Apperror.js";
import { sendTokenResponse } from "../../../utils/Generatetoken.js";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.js";

import { sendEmail } from "../../../helpers/sendEmail.js";

import * as userService from "../service/User.service.js";

// =========================================
// REGISTER
// =========================================

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const user = await userService.registerUser({
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
    "Registered successfully",
  );
});

// =========================================
// LOGIN
// =========================================

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.loginUser({
    email,
    password,
  });

  return sendTokenResponse(
    apiResponse,
    user,
    200,
    res,
    "Logged in successfully",
  );
});

// =========================================
// LOGOUT
// =========================================

export const logout = asyncHandler(async (req, res) => {
  res.cookie("accessToken", "none", {
    expires: new Date(Date.now() + 10 * 1000),

    httpOnly: true,
  });

  return apiResponse(res, 200, "Logged out successfully", null);
});

// =========================================
// GET ME
// =========================================

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);

  return apiResponse(res, 200, "User fetched successfully", {
    user,
  });
});

// =========================================
// UPDATE ME
// =========================================

export const updateMe = asyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "avatars");

    updates.avatar = result.secure_url;
    updates.avatarPublicId = result.public_id;
  }

  const user = await userService.updateUserProfile(req.user.id, updates);

  return apiResponse(res, 200, "Profile updated successfully", {
    user,
  });
});

// =========================================
// CHANGE PASSWORD
// =========================================

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await userService.changeUserPassword(
    req.user.id,
    currentPassword,
    newPassword,
  );

  return sendTokenResponse(
    apiResponse,
    user,
    200,
    res,
    "Password changed successfully",
  );
});

// =========================================
// FORGOT PASSWORD
// Step 1: Send OTP
// =========================================

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const { otp } = await userService.createPasswordResetOtp(email);

  await sendEmail(email, otp, "forgot-password");

  return apiResponse(res, 200, "OTP sent to your email", null);
});

// =========================================
// VERIFY RESET OTP
// Step 2
// =========================================

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const resetToken = await userService.verifyPasswordResetOtp(email, otp);

  return apiResponse(res, 200, "OTP verified successfully", {
    resetToken,
  });
});

// =========================================
// RESET PASSWORD
// Step 3
// =========================================

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  const user = await userService.resetUserPassword(resetToken, newPassword);

  return sendTokenResponse(
    apiResponse,
    user,
    200,
    res,
    "Password reset successful",
  );
});

// =========================================
// VERIFY EMAIL
// =========================================

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await userService.verifyEmailOtp(email, otp);

  return sendTokenResponse(
    apiResponse,
    user,
    200,
    res,
    "Email verified successfully",
  );
});

// =========================================
// RESEND VERIFICATION
// =========================================

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await userService.resendVerificationOtp(email);

  return apiResponse(res, 200, "OTP resent to email", null);
});

// =========================================
// DEACTIVATE ACCOUNT
// =========================================

export const deactivateMe = asyncHandler(async (req, res) => {
  await userService.deactivateUser(req.user.id);

  return apiResponse(res, 200, "Account deactivated successfully", null);
});

// =========================================
// GET ALL USERS
// =========================================

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role } = req.query;

  const result = await userService.getAllUsers({
    page,
    limit,
    role,
  });

  return apiResponse(res, 200, "Users fetched successfully", result);
});

// =========================================
// UPDATE ROLE
// =========================================

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { role } = req.body;

  const user = await userService.updateUserRole(id, role);

  return apiResponse(res, 200, "User role updated successfully", {
    user,
  });
});

// =========================================
// 🆕 UPDATE USER STATUS (isActive true/false)
// =========================================

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { isActive } = req.body;

  const user = await userService.updateUserStatus(id, isActive, req.user.id);

  return apiResponse(
    res,
    200,
    `User ${isActive ? "activated" : "deactivated"} successfully`,
    {
      user,
    },
  );
});

// =========================================================
// 🆕 ADMIN: CREATE / UPDATE / DELETE USER (mentor)
// =========================================================

/**
 * @route   POST /api/v1/auth
 * @access  Private (authorize + authorizeRole('admin'))
 * multipart/form-data: name, email, password, role, phone?, avatar? (image file)
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  // Avatar optional. Thakle Cloudinary te upload hoy
  let avatar = "";
  let avatarPublicId = "";

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "avatars");

    avatar = result.secure_url;
    avatarPublicId = result.public_id;
  }

  const user = await userService.createUserByAdmin({
    name,
    email,
    password,
    phone,
    role,
    avatar,
    avatarPublicId,
  });

  return apiResponse(res, 201, "User created successfully", {
    user,
  });
});

/**
 * @route   PATCH /api/v1/auth/:id
 * @access  Private (authorize + authorizeRole('admin'))
 * multipart/form-data: name?, email?, password?, phone?, avatar? (image file)
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hasBodyFields = Object.keys(req.body).length > 0;

  if (!hasBodyFields && !req.file) {
    throw new AppError(
      "At least one field or an image is required to update",
      400,
    );
  }

  const updates = {
    ...req.body,
  };

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "avatars");

    updates.avatar = result.secure_url;
    updates.avatarPublicId = result.public_id;
  }

  const user = await userService.updateUserByAdmin(id, updates);

  return apiResponse(res, 200, "User updated successfully", {
    user,
  });
});

/**
 * @route   DELETE /api/v1/auth/:id
 * @access  Private (authorize + authorizeRole('admin'))
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await userService.deleteUserByAdmin(id);

  return apiResponse(res, 200, "User deleted successfully", null);
});
