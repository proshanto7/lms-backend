import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "student",
        "mentor",
        "admin",
      ],
      default: "student",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // =====================================
    // Email Verification
    // =====================================

    emailVerificationOtp: {
      type: String,
      select: false,
    },

    emailVerificationOtpExpires: {
      type: Date,
      select: false,
    },

    // =====================================
    // Password Reset OTP
    // =====================================

    passwordResetOtp: {
      type: String,
      select: false,
    },

    passwordResetOtpExpires: {
      type: Date,
      select: false,
    },

    // =====================================
    // Password Reset Token
    // =====================================

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);


// =========================================
// Password Hash
// =========================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password =
    await bcrypt.hash(
      this.password,
      12
    );
});


// =========================================
// Compare Password
// =========================================

userSchema.methods.comparePassword =
  async function (candidatePassword) {
    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };


export default
  mongoose.models.User ||
  mongoose.model(
    "User",
    userSchema
  );