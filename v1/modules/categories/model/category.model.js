import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      url: { type: String },
      publicId: { type: String }, // needed to delete from Cloudinary later
    },
    color: {
      type: String,
      default: "#7d7f4c",
    },
  },
  { timestamps: true },
);

categorySchema.pre("validate", function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
