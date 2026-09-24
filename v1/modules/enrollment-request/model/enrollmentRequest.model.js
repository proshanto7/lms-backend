import mongoose from "mongoose";

const enrollmentRequestSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be one of: pending, approved, rejected",
      },
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

// a student can only have ONE pending request per course at a time
// (once approved/rejected, they're free to request that course again)
enrollmentRequestSchema.index(
  { student: 1, course: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  },
);

export default mongoose.models.EnrollmentRequest ||
  mongoose.model("EnrollmentRequest", enrollmentRequestSchema);
