import Joi from "joi";


// =========================================
// REGISTER
// =========================================

export const registerSchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .max(100)
      .required()
      .messages({
        "string.empty":
          "Name is required",

        "any.required":
          "Name is required",

        "string.max":
          "Name cannot exceed 100 characters",
      }),

    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required()
      .messages({
        "string.empty":
          "Email is required",

        "any.required":
          "Email is required",

        "string.email":
          "Please enter a valid email",
      }),

    password: Joi.string()
      .min(8)
      .required()
      .messages({
        "string.empty":
          "Password is required",

        "any.required":
          "Password is required",

        "string.min":
          "Password must be at least 8 characters",
      }),

    phone: Joi.string()
      .trim()
      .optional()
      .allow(""),

    avatar: Joi.string()
      .uri()
      .optional()
      .allow(""),
  });


// =========================================
// LOGIN
// =========================================

export const loginSchema =
  Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required()
      .messages({
        "string.empty":
          "Email is required",

        "any.required":
          "Email is required",

        "string.email":
          "Please enter a valid email",
      }),

    password: Joi.string()
      .required()
      .messages({
        "string.empty":
          "Password is required",

        "any.required":
          "Password is required",
      }),
  });


// =========================================
// VERIFY EMAIL OTP
// =========================================

export const verifyEmailSchema =
  Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required(),

    otp: Joi.string()
      .trim()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        "string.empty":
          "OTP is required",

        "any.required":
          "OTP is required",

        "string.length":
          "OTP must be 6 digits",

        "string.pattern.base":
          "OTP must contain only numbers",
      }),
  });


// =========================================
// RESEND EMAIL OTP
// =========================================

export const resendVerificationSchema =
  Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required()
      .messages({
        "string.empty":
          "Email is required",

        "any.required":
          "Email is required",
      }),
  });


// =========================================
// FORGOT PASSWORD
// Step 1
// =========================================

export const forgotPasswordSchema =
  Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required()
      .messages({
        "string.empty":
          "Email is required",

        "any.required":
          "Email is required",

        "string.email":
          "Please enter a valid email",
      }),
  });


// =========================================
// VERIFY RESET OTP
// Step 2
// =========================================

export const verifyResetOtpSchema =
  Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required()
      .messages({
        "string.empty":
          "Email is required",

        "any.required":
          "Email is required",

        "string.email":
          "Please enter a valid email",
      }),

    otp: Joi.string()
      .trim()
      .length(6)
      .pattern(/^\d+$/)
      .required()
      .messages({
        "string.empty":
          "OTP is required",

        "any.required":
          "OTP is required",

        "string.length":
          "OTP must be 6 digits",

        "string.pattern.base":
          "OTP must contain only numbers",
      }),
  });


// =========================================
// RESET PASSWORD
// Step 3
// =========================================

export const resetPasswordSchema =
  Joi.object({
    resetToken: Joi.string()
      .trim()
      .required()
      .messages({
        "string.empty":
          "Reset token is required",

        "any.required":
          "Reset token is required",
      }),

    newPassword: Joi.string()
      .min(8)
      .required()
      .messages({
        "string.empty":
          "New password is required",

        "any.required":
          "New password is required",

        "string.min":
          "New password must be at least 8 characters",
      }),
  });


// =========================================
// UPDATE PROFILE
// =========================================

export const updateUserSchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .max(100),

    phone: Joi.string()
      .trim()
      .allow(""),

    avatar: Joi.string()
      .uri()
      .allow(""),
  })
    .min(1)
    .messages({
      "object.min":
        "At least one field is required to update",
    });


// =========================================
// CHANGE PASSWORD
// =========================================

export const changePasswordSchema =
  Joi.object({
    currentPassword: Joi.string()
      .required(),

    newPassword: Joi.string()
      .min(8)
      .required()
      .messages({
        "string.empty":
          "New password is required",

        "any.required":
          "New password is required",

        "string.min":
          "New password must be at least 8 characters",
      }),
  });


// =========================================
// UPDATE ROLE
// =========================================

export const updateRoleSchema =
  Joi.object({
    role: Joi.string()
      .valid(
        "student",
        "mentor",
        "admin"
      )
      .required()
      .messages({
        "any.required":
          "Role is required",

        "any.only":
          "Role must be one of: student, mentor, admin",
      }),
  });


// =========================================
// ADMIN: CREATE USER (mentor / student)
// =========================================

export const createUserSchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .max(100)
      .required()
      .messages({
        "string.empty":
          "Name is required",

        "any.required":
          "Name is required",

        "string.max":
          "Name cannot exceed 100 characters",
      }),

    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .required()
      .messages({
        "string.empty":
          "Email is required",

        "any.required":
          "Email is required",

        "string.email":
          "Please enter a valid email",
      }),

    password: Joi.string()
      .min(8)
      .required()
      .messages({
        "string.empty":
          "Password is required",

        "any.required":
          "Password is required",

        "string.min":
          "Password must be at least 8 characters",
      }),

    role: Joi.string()
      .valid(
        "student",
        "mentor",
        "admin"
      )
      .required()
      .messages({
        "any.required":
          "Role is required",

        "any.only":
          "Role must be one of: student, mentor, admin",
      }),

    phone: Joi.string()
      .trim()
      .optional()
      .allow(""),

    avatar: Joi.string()
      .uri()
      .optional()
      .allow(""),
  });


// =========================================
// ADMIN: UPDATE USER
// (role change er jonno alada route ache: PATCH /:id/role)
// =========================================

export const updateUserByAdminSchema =
  Joi.object({
    name: Joi.string()
      .trim()
      .max(100)
      .messages({
        "string.empty":
          "Name cannot be empty",

        "string.max":
          "Name cannot exceed 100 characters",
      }),

    email: Joi.string()
      .trim()
      .lowercase()
      .email()
      .messages({
        "string.empty":
          "Email cannot be empty",

        "string.email":
          "Please enter a valid email",
      }),

    password: Joi.string()
      .min(8)
      .messages({
        "string.empty":
          "Password cannot be empty",

        "string.min":
          "Password must be at least 8 characters",
      }),

    phone: Joi.string()
      .trim()
      .allow(""),

    avatar: Joi.string()
      .uri()
      .allow(""),
  });

