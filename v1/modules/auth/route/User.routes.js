import express from "express";

import * as userController from "../controller/user.controller.js";

import UploadMiddleware from "../../../middleware/upload.middleware.js";

import { authorize } from "../../../middleware/authorize.js";

import { authorizeRole } from "../../../middleware/authorizeRole.js";

import { validate } from "../../../middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateRoleSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  verifyResetOtpSchema,
  createUserSchema, // 🆕 admin: user create
  updateUserByAdminSchema, // 🆕 admin: user edit
  updateStatusSchema, // 🆕 admin: user active/inactive
} from "../validation/user.validation.js";

const router = express.Router();

// =========================================
// 🆕 Avatar Upload (category icon er moto: UploadMiddleware → Cloudinary)
// =========================================

const uploadAvatar = UploadMiddleware(["jpg", "png", "webp"], 2).single(
  "avatar",
);

// =========================================
// PUBLIC ROUTES
// =========================================

router.post("/register", validate(registerSchema), userController.register);

router.post("/login", validate(loginSchema), userController.login);

// =========================================
// Email Verification
// =========================================

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  userController.verifyEmail,
);

router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  userController.resendVerification,
);

// =========================================
// Forgot Password
// =========================================

// Step 1: Email → OTP
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  userController.forgotPassword,
);

// Step 2: Email + OTP → Reset Token
router.post(
  "/verify-reset-otp",
  validate(verifyResetOtpSchema),
  userController.verifyResetOtp,
);

// Step 3: Reset Token + New Password
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  userController.resetPassword,
);

// =========================================
// PROTECTED ROUTES
// =========================================

router.post("/logout", authorize, userController.logout);

router.get("/me", authorize, userController.getMe);

router.patch(
  "/me",
  authorize,
  uploadAvatar,
  validate(updateUserSchema),
  userController.updateMe,
);

router.patch(
  "/change-password",
  authorize,
  validate(changePasswordSchema),
  userController.changePassword,
);

router.delete("/me", authorize, userController.deactivateMe);

// =========================================
// ADMIN ROUTES
// =========================================
// NOTE: "/:id"

router.get("/", authorize, authorizeRole("admin"), userController.getAllUsers);

router.patch(
  "/:id/role",
  authorize,
  authorizeRole("admin"),
  validate(updateRoleSchema),
  userController.updateUserRole,
);

// 🆕 Admin: user active/inactive (isActive) toggle
router.patch(
  "/:id/status",
  authorize,
  authorizeRole("admin"),
  validate(updateStatusSchema),
  userController.updateUserStatus,
);

// 🆕 Admin: notun user (mentor) create + optional avatar image
// uploadAvatar ageh thakte hobe, tahole validate() req.body dekhte pay
router.post(
  "/",
  authorize,
  authorizeRole("admin"),
  uploadAvatar,
  validate(createUserSchema),
  userController.createUser,
);

// 🆕 Admin: user edit (name, email, optional password, optional avatar image)
router.patch(
  "/:id",
  authorize,
  authorizeRole("admin"),
  uploadAvatar,
  validate(updateUserByAdminSchema),
  userController.updateUser,
);

// 🆕 Admin: mentor delete
router.delete(
  "/:id",
  authorize,
  authorizeRole("admin"),
  userController.deleteUser,
);

export default router;
