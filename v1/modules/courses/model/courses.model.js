import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true , "title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    students: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      url: { type: String },
      publicId: { type: String }, // needed to delete from Cloudinary later
    },
  },
  { timestamps: true },
);

courseSchema.pre("validate", function () {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
});

export default mongoose.models.Course ||
  mongoose.model("Course", courseSchema);