import crypto from "crypto";

import User from "../model/user.model.js";
import Course from "../../courses/model/courses.model.js";
import AppError from "../../../utils/Apperror.js";
import { sendEmail } from "../../../helpers/sendEmail.js";
import { deleteFromCloudinary } from "../../../utils/cloudinaryUpload.js";

// =========================================
// OTP Configuration
// =========================================

const EMAIL_OTP_EXPIRES_MS = 2 * 60 * 1000; // 2 minutes

const PASSWORD_RESET_OTP_EXPIRES_MS = 10 * 60 * 1000; // 10 minutes

const PASSWORD_RESET_TOKEN_EXPIRES_MS = 10 * 60 * 1000; // 10 minutes

// =========================================
// Generate OTP
// =========================================

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// =========================================
// Hash value
// =========================================

const hashValue = (value) => {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
};

// =========================================
// Issue Email Verification OTP
// =========================================

const issueVerificationOtp = async (user, type) => {
  const rawOtp = generateOtp();

  user.emailVerificationOtp = hashValue(rawOtp);

  user.emailVerificationOtpExpires = Date.now() + EMAIL_OTP_EXPIRES_MS;

  await user.save({
    validateBeforeSave: false,
  });

  await sendEmail(user.email, rawOtp, type);
};

// =========================================
// Register User
// =========================================

export const registerUser = async ({ name, email, password, phone }) => {
  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  await issueVerificationOtp(user, "signup");

  return user;
};

// =========================================
// Login
// =========================================

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  user.password = undefined;

  return user;
};

// =========================================
// Verify Email OTP
// =========================================

export const verifyEmailOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new AppError("Please provide email and OTP", 400);
  }

  const hashedOtp = hashValue(otp);

  const user = await User.findOne({
    email,

    emailVerificationOtp: hashedOtp,

    emailVerificationOtpExpires: {
      $gt: Date.now(),
    },
  }).select("+emailVerificationOtp +emailVerificationOtpExpires");

  if (!user) {
    throw new AppError("OTP is invalid or has expired", 400);
  }

  user.isVerified = true;

  user.emailVerificationOtp = undefined;
  user.emailVerificationOtpExpires = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  return user;
};

// =========================================
// Resend Verification OTP
// =========================================

export const resendVerificationOtp = async (email) => {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new AppError("No account found with that email", 404);
  }

  if (user.isVerified) {
    throw new AppError("This email is already verified", 400);
  }

  await issueVerificationOtp(user, "resentOpt");

  return true;
};

// =========================================
// FORGOT PASSWORD
// Step 1: Generate + Send OTP
// =========================================

export const createPasswordResetOtp = async (email) => {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new AppError("No account found with that email", 404);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  const rawOtp = generateOtp();

  const hashedOtp = hashValue(rawOtp);

  user.passwordResetOtp = hashedOtp;

  user.passwordResetOtpExpires = Date.now() + PASSWORD_RESET_OTP_EXPIRES_MS;

  // Remove previous reset token
  user.passwordResetToken = undefined;

  user.passwordResetTokenExpires = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  return {
    user,
    otp: rawOtp,
  };
};

// =========================================
// FORGOT PASSWORD
// Step 2: Verify OTP
// =========================================

export const verifyPasswordResetOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new AppError("Email and OTP are required", 400);
  }

  const hashedOtp = hashValue(otp);

  const user = await User.findOne({
    email,

    passwordResetOtp: hashedOtp,

    passwordResetOtpExpires: {
      $gt: Date.now(),
    },
  }).select("+passwordResetOtp +passwordResetOtpExpires");

  if (!user) {
    throw new AppError("OTP is invalid or has expired", 400);
  }

  // =====================================
  // Generate Temporary Reset Token
  // =====================================

  const rawResetToken = crypto.randomBytes(32).toString("hex");

  const hashedResetToken = hashValue(rawResetToken);

  user.passwordResetToken = hashedResetToken;

  user.passwordResetTokenExpires = Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_MS;

  // OTP is now used
  user.passwordResetOtp = undefined;

  user.passwordResetOtpExpires = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  return rawResetToken;
};

// =========================================
// Step 3: Reset Password
// =========================================

export const resetUserPassword = async (resetToken, newPassword) => {
  if (!resetToken || !newPassword) {
    throw new AppError("Reset token and new password are required", 400);
  }

  const hashedToken = hashValue(resetToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,

    passwordResetTokenExpires: {
      $gt: Date.now(),
    },
  }).select("+passwordResetToken +passwordResetTokenExpires");

  if (!user) {
    throw new AppError("Reset token is invalid or has expired", 400);
  }

  // =====================================
  // Set New Password
  // =====================================

  user.password = newPassword;

  // =====================================
  // Remove Reset Data
  // =====================================

  user.passwordResetToken = undefined;

  user.passwordResetTokenExpires = undefined;

  await user.save();

  return user;
};

// =========================================
// Get User By ID
// =========================================

export const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new AppError("User not found", 404);
  }

  return user;
};

// =========================================
// Update Profile
// =========================================

export const updateUserProfile = async (userId, updates) => {
  const allowedFields = ["name", "phone", "avatar", "avatarPublicId"];

  const filteredUpdates = {};

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const user = await User.findById(userId).select("+avatarPublicId");

  if (!user) {
    if (filteredUpdates.avatarPublicId) {
      await deleteFromCloudinary(filteredUpdates.avatarPublicId); // rollback
    }
    throw new AppError("User not found", 404);
  }

  const oldAvatarPublicId = user.avatarPublicId;

  Object.assign(user, filteredUpdates);
  await user.save({ validateBeforeSave: true });

  if (filteredUpdates.avatarPublicId && oldAvatarPublicId) {
    await deleteFromCloudinary(oldAvatarPublicId);
  }

  return user;
};

// =========================================
// Change Password
// =========================================

export const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword,
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword;

  await user.save();

  return user;
};

// =========================================
// Deactivate User
// =========================================

export const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isActive: false,
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

// =========================================
// Get All Users
// =========================================

export const getAllUsers = async ({ page = 1, limit = 20, role }) => {
  const filter = {};

  if (role) {
    filter.role = role;
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limitNumber).sort({
      createdAt: -1,
    }),

    User.countDocuments(filter),
  ]);

  return {
    users,

    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

// =========================================
// Update User Role
// =========================================

export const updateUserRole = async (userId, role) => {
  const validRoles = ["student", "mentor", "admin"];

  if (!validRoles.includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      role,
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

// =========================================
// 🆕 Update User Status (isActive true/false)
// =========================================

export const updateUserStatus = async (userId, isActive, requestUserId) => {
  // Admin nijeke deactivate korte parbe na (accidentally nijer access hariye
  // felte pare)
  if (requestUserId && String(userId) === String(requestUserId) && !isActive) {
    throw new AppError("You cannot deactivate your own account", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isActive,
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

// =========================================================
// 🆕 ADMIN: CREATE / UPDATE / DELETE USER (mentor)
// =========================================================

// Response e password / avatarPublicId jate leak na hoy
const sanitizeUser = (user) => {
  const safeUser = user.toObject();

  delete safeUser.password;
  delete safeUser.avatarPublicId;

  return safeUser;
};

// Upload hoye jawa image rollback (error hole)
const removeUploadedImage = async (publicId) => {
  if (publicId) {
    await deleteFromCloudinary(publicId);
  }
};

// =========================================
// Admin: Create User
// avatar = { url, publicId } Cloudinary theke controller e set hoy
// =========================================

export const createUserByAdmin = async ({
  name,
  email,
  password,
  phone,
  role,
  avatar,
  avatarPublicId,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    await removeUploadedImage(avatarPublicId); // rollback uploaded image
    throw new AppError("Email is already registered", 409);
  }

  // Password model er pre("save") hook e hash hoy.
  // Admin create korle OTP lagbe na, tai isVerified: true
  let user;

  try {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      role,
      avatar,
      avatarPublicId,
      isVerified: true,
    });
  } catch (err) {
    await removeUploadedImage(avatarPublicId); // create fail hole upload kora image muche felo
    throw err;
  }

  return sanitizeUser(user);
};

// =========================================
// Admin: Update User
// notun avatar upload hole purano Cloudinary image muche dey
// =========================================

export const updateUserByAdmin = async (userId, updates) => {
  const allowedFields = [
    "name",
    "email",
    "password",
    "phone",
    "avatar",
    "avatarPublicId",
  ];

  const filteredUpdates = {};

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  if (filteredUpdates.email) {
    filteredUpdates.email = filteredUpdates.email.trim().toLowerCase();

    const duplicate = await User.findOne({
      email: filteredUpdates.email,
      _id: { $ne: userId },
    });

    if (duplicate) {
      await removeUploadedImage(filteredUpdates.avatarPublicId);
      throw new AppError("Email is already registered", 409);
    }
  }

  const user = await User.findById(userId).select("+avatarPublicId");

  if (!user) {
    await removeUploadedImage(filteredUpdates.avatarPublicId);
    throw new AppError("User not found", 404);
  }

  const oldAvatarPublicId = user.avatarPublicId;

  // save() use korchi, tai password thakle pre("save") hook hash korbe
  Object.assign(user, filteredUpdates);

  try {
    await user.save();
  } catch (err) {
    await removeUploadedImage(filteredUpdates.avatarPublicId);
    throw err;
  }

  // Save successful hole tarpor purano image delete
  if (filteredUpdates.avatarPublicId && oldAvatarPublicId) {
    await removeUploadedImage(oldAvatarPublicId);
  }

  return sanitizeUser(user);
};

// =========================================
// Admin: Delete User
// Shudhu mentor delete kora jay (student er enrollment/progress data thake).
// Mentor kono course er instructor hole delete block hobe.
// =========================================

export const deleteUserByAdmin = async (userId) => {
  const user = await User.findById(userId).select("+avatarPublicId");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "mentor") {
    throw new AppError("Only mentor accounts can be deleted from here", 403);
  }

  // Course model e instructor field er nam instructorId ba instructor
  // je-i hok, ei line kaj korbe
  const instructorField = Course.schema.path("instructorId")
    ? "instructorId"
    : "instructor";

  const courseCount = await Course.countDocuments({
    [instructorField]: user._id,
  });

  if (courseCount > 0) {
    throw new AppError(
      `Cannot delete mentor: ${courseCount} course(s) still assigned to them`,
      409,
    );
  }

  await user.deleteOne();

  await removeUploadedImage(user.avatarPublicId);

  return true;
};
