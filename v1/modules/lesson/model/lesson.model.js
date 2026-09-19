import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    video: {
      url: { type: String, required: [true, "Video URL is required"] },
      publicId: { type: String, required: [true, "Video public ID is required"] },
      duration: { type: Number, default: 0 }, // seconds
    },
    order: {
      type: Number,
      required: [true, "Order is required"],
      min: [1, "Order must be at least 1"],
    },
    isPreview: {
      type: Boolean,
      default: false, // true হলে enrollment ছাড়াই দেখা যাবে (free trailer)
    },
  },
  { timestamps: true, versionKey: false },
);

lessonSchema.index({ course: 1, order: 1 }, { unique: true });

export default mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);