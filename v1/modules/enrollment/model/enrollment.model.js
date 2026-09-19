import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
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
    enrolledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Enrolled by (admin) is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "revoked"],
        message: "Status must be either active or revoked",
      },
      default: "active",
    },
  },
  { timestamps: true, versionKey: false },
);

// same student can't be enrolled twice in same course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.models.Enrollment ||
  mongoose.model("Enrollment", enrollmentSchema);